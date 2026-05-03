import Project from "../models/Project.js";
import Client from "../models/Client.js";
import { AppError } from "../utils/AppError.js";
import { getIO } from "../socket.js";

export const createProject = async (req, res) => {
    const { company, _id: user } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const client = await Client.findOne({ _id: req.body.client, company, deleted: false });
    if (!client) throw AppError.notFound("Cliente");

    const existing = await Project.findOne({ company, projectCode: req.body.projectCode });
    if (existing) throw AppError.conflict("Ya existe un proyecto con ese código en tu compañía");

    const project = await Project.create({ ...req.body, user, company });

    getIO().to(`company:${company}`).emit('project:new', project);

    res.status(201).json({ project });
};

export const getProjects = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const { page = 1, limit = 10, name, client, active, sort = '-createdAt' } = req.query;

    const filter = { company, deleted: false };
    if (name)   filter.name   = { $regex: name, $options: 'i' };
    if (client) filter.client = client;
    if (active !== undefined) filter.active = active === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / Number(limit));

    const projects = await Project.find(filter)
        .populate('client', 'name cif')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

    res.json({ projects, currentPage: Number(page), totalPages, totalItems });
};

export const getProject = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const project = await Project.findOne({ _id: req.params.id, company, deleted: false })
        .populate('client', 'name cif email');

    if (!project) throw AppError.notFound("Proyecto");

    res.json({ project });
};

export const updateProject = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    if (req.body.client) {
        const client = await Client.findOne({ _id: req.body.client, company, deleted: false });
        if (!client) throw AppError.notFound("Cliente");
    }

    if (req.body.projectCode) {
        const duplicate = await Project.findOne({
            company,
            projectCode: req.body.projectCode,
            _id: { $ne: req.params.id }
        });
        if (duplicate) throw AppError.conflict("Ya existe un proyecto con ese código en tu compañía");
    }

    const project = await Project.findOneAndUpdate(
        { _id: req.params.id, company, deleted: false },
        req.body,
        { new: true, runValidators: true }
    ).populate('client', 'name cif');

    if (!project) throw AppError.notFound("Proyecto");

    res.json({ project });
};

export const deleteProject = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const isSoft = req.query.soft === "true";

    let project;
    if (isSoft) {
        project = await Project.findOneAndUpdate(
            { _id: req.params.id, company, deleted: false },
            { deleted: true, deletedAt: new Date() },
            { new: true }
        );
    } else {
        project = await Project.findOneAndDelete({ _id: req.params.id, company });
    }

    if (!project) throw AppError.notFound("Proyecto");

    res.json({ message: `Proyecto eliminado (${isSoft ? 'lógico' : 'físico'})`, project });
};

export const getArchivedProjects = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const { page = 1, limit = 10, sort = '-deletedAt' } = req.query;

    const filter = { company, deleted: true };
    const skip = (Number(page) - 1) * Number(limit);
    const totalItems = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / Number(limit));

    const projects = await Project.find(filter)
        .populate('client', 'name cif')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

    res.json({ projects, currentPage: Number(page), totalPages, totalItems });
};

export const restoreProject = async (req, res) => {
    const { company } = req.user;

    if (!company) throw AppError.forbidden("No tienes una compañía asociada");

    const project = await Project.findOneAndUpdate(
        { _id: req.params.id, company, deleted: true },
        { deleted: false, deletedAt: null },
        { new: true }
    );

    if (!project) throw AppError.notFound("Proyecto archivado");

    res.json({ message: "Proyecto restaurado", project });
};
