import Client from "../models/Client.js";
import { AppError } from "../utils/AppError.js";

export const createClient = async (req, res) => {
    const { company, _id: user } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const existing = await Client.findOne({ company, cif: req.body.cif });
    if (existing) throw AppError.conflict("Ya existe un cliente con ese CIF en tu compañía");

    const client = await Client.create({ ...req.body, user, company });

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
