import DeliveryNote from "../models/DeliveryNote.js";
import Project from "../models/Project.js";
import { AppError } from "../utils/AppError.js";
import { uploadSignature, uploadPdf } from "../services/storage.service.js";
import { generateDeliveryNotePdf } from "../services/pdf.service.js";
import { getIO } from "../socket.js";

export const createDeliveryNote = async (req, res) => {
    const { company, _id: user } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const project = await Project.findOne({ _id: req.body.project, company, deleted: false });
    if (!project) throw AppError.notFound("Proyecto");

    const deliveryNote = await DeliveryNote.create({
        ...req.body,
        user,
        company,
        client: project.client
    });

    getIO().to(`company:${company}`).emit('deliverynote:new', deliveryNote);

    res.status(201).json({ deliveryNote });
};

export const getDeliveryNotes = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const { page = 1, limit = 10, project, client, format, signed, from, to, sort = '-workDate' } = req.query;

    const filter = { company, deleted: false };
    if (project) filter.project = project;
    if (client)  filter.client  = client;
    if (format)  filter.format  = format;
    if (signed !== undefined) filter.signed = signed === 'true';
    if (from || to) {
        filter.workDate = {};
        if (from) filter.workDate.$gte = new Date(from);
        if (to)   filter.workDate.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await DeliveryNote.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / Number(limit));

    const deliveryNotes = await DeliveryNote.find(filter)
        .populate('client',  'name cif')
        .populate('project', 'name projectCode')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

    res.json({ deliveryNotes, currentPage: Number(page), totalPages, totalItems });
};

export const getDeliveryNote = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
        .populate('user',    'name lastName email')
        .populate('client',  'name cif email phone address')
        .populate('project', 'name projectCode address email notes');

    if (!deliveryNote) throw AppError.notFound("Albarán");

    res.json({ deliveryNote });
};

export const signDeliveryNote = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");
    if (!req.file) throw AppError.badRequest("No se ha subido ninguna firma");

    const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
        .populate('user',    'name lastName email')
        .populate('client',  'name cif email phone address')
        .populate('project', 'name projectCode notes');

    if (!deliveryNote) throw AppError.notFound("Albarán");
    if (deliveryNote.signed) throw AppError.conflict("El albarán ya está firmado");

    const signatureUrl = await uploadSignature(req.file.buffer);

    deliveryNote.signed       = true;
    deliveryNote.signedAt     = new Date();
    deliveryNote.signatureUrl = signatureUrl;

    const pdfBuffer = await generateDeliveryNotePdf(deliveryNote.toObject());
    const pdfUrl    = await uploadPdf(pdfBuffer);

    deliveryNote.pdfUrl = pdfUrl;
    await deliveryNote.save();

    getIO().to(`company:${company}`).emit('deliverynote:signed', deliveryNote);

    res.json({ message: "Albarán firmado", deliveryNote });
};

export const downloadPdf = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
        .populate('user',    'name lastName email')
        .populate('client',  'name cif email phone address')
        .populate('project', 'name projectCode notes');

    if (!deliveryNote) throw AppError.notFound("Albarán");

    if (deliveryNote.pdfUrl) {
        return res.redirect(deliveryNote.pdfUrl);
    }

    const pdfBuffer = await generateDeliveryNotePdf(deliveryNote.toObject());

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="albaran-${deliveryNote._id}.pdf"`);
    res.send(pdfBuffer);
};

export const deleteDeliveryNote = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const deliveryNote = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false });
    if (!deliveryNote) throw AppError.notFound("Albarán");

    if (deliveryNote.signed) throw AppError.forbidden("No se puede eliminar un albarán firmado");

    await DeliveryNote.findByIdAndDelete(req.params.id);

    res.json({ message: "Albarán eliminado" });
};
