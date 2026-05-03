import Client from "../models/Client.js";
import { AppError } from "../utils/AppError.js";
import { getIO } from "../socket.js";

export const createClient = async (req, res) => {
    const { company, _id: user } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const existing = await Client.findOne({ company, cif: req.body.cif });
    if (existing) throw AppError.conflict("Ya existe un cliente con ese CIF en tu compañía");

    const client = await Client.create({ ...req.body, user, company });

    getIO().to(`company:${company}`).emit('client:new', client);

    res.status(201).json({ client });
};

export const getClients = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const { page = 1, limit = 10, name, sort = '-createdAt' } = req.query;

    const filter = { company, deleted: false };
    if (name) filter.name = { $regex: name, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Client.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / Number(limit));

    const clients = await Client.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

    res.json({
        clients,
        currentPage: Number(page),
        totalPages,
        totalItems
    });
};

export const getClient = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const client = await Client.findOne({ _id: req.params.id, company, deleted: false });
    if (!client) throw AppError.notFound("Cliente");

    res.json({ client });
};

export const deleteClient = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const isSoft = req.query.soft === "true";

    let client;
    if (isSoft) {
        client = await Client.findOneAndUpdate(
            { _id: req.params.id, company, deleted: false },
            { deleted: true, deletedAt: new Date() },
            { new: true }
        );
    } else {
        client = await Client.findOneAndDelete({ _id: req.params.id, company });
    }

    if (!client) throw AppError.notFound("Cliente");

    res.json({ message: `Cliente eliminado (${isSoft ? 'lógico' : 'físico'})`, client });
};

export const getArchivedClients = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const { page = 1, limit = 10, sort = '-deletedAt' } = req.query;

    const filter = { company, deleted: true };
    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Client.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / Number(limit));

    const clients = await Client.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

    res.json({ clients, currentPage: Number(page), totalPages, totalItems });
};

export const restoreClient = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const client = await Client.findOneAndUpdate(
        { _id: req.params.id, company, deleted: true },
        { deleted: false, deletedAt: null },
        { new: true }
    );

    if (!client) throw AppError.notFound("Cliente archivado");

    res.json({ message: "Cliente restaurado", client });
};

export const updateClient = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    if (req.body.cif) {
        const duplicate = await Client.findOne({
            company,
            cif: req.body.cif,
            _id: { $ne: req.params.id }
        });
        if (duplicate) throw AppError.conflict("Ya existe un cliente con ese CIF en tu compañía");
    }

    const client = await Client.findOneAndUpdate(
        { _id: req.params.id, company, deleted: false },
        req.body,
        { new: true, runValidators: true }
    );

    if (!client) throw AppError.notFound("Cliente");

    res.json({ client });
};
