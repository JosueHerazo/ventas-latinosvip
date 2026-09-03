"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorks = exports.getWorks = exports.createWorks = void 0;
const Trabajo_models_1 = __importDefault(require("../models/Trabajo.models"));
const cloudinaryWorks_1 = require("../config/cloudinaryWorks");
const createWorks = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file" });
        }
        const result = await new Promise((resolve, reject) => {
            cloudinaryWorks_1.cloudinary.uploader.upload_stream({ resource_type: "auto", folder: "trabajos" }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            }).end(file.buffer);
        });
        const trabajo = await Trabajo_models_1.default.create({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            categoria: req.body.categoria,
            tipo: result.resource_type,
            url: result.secure_url,
            publicId: result.public_id,
            barbero: req.body.barbero
        });
        res.json({ data: trabajo });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear trabajo" });
    }
};
exports.createWorks = createWorks;
// GET
const getWorks = async (req, res) => {
    try {
        const trabajos = await Trabajo_models_1.default.findAll({
            order: [["createdAt", "DESC"]]
        });
        res.json({ data: trabajos });
    }
    catch (error) {
        res.status(500).json({ error: "Error al obtener trabajos" });
    }
};
exports.getWorks = getWorks;
// POST
// DELETE
const deleteWorks = async (req, res) => {
    try {
        const trabajo = await Trabajo_models_1.default.findByPk(req.params.id);
        if (!trabajo) {
            return res.status(404).json({ error: "No encontrado" });
        }
        if (trabajo.publicId) {
            await cloudinaryWorks_1.cloudinary.uploader.destroy(trabajo.publicId, {
                resource_type: trabajo.tipo === "video" ? "video" : "image"
            });
        }
        await trabajo.destroy();
        res.json({ data: "Eliminado" });
    }
    catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
};
exports.deleteWorks = deleteWorks;
//# sourceMappingURL=works.Handlers.js.map