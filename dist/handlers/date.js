"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorks = exports.getWorks = exports.createWorks = exports.deleteBarberos = exports.updateBarberos = exports.saveBarberos = exports.getBarberAvailability = exports.addBarbero = exports.getBarberos = exports.deleteDate = exports.updateAppointmentStatus = exports.UpdateDate = exports.getDateById = exports.createDate = exports.getDates = void 0;
const sequelize_1 = require("sequelize");
const Clients_models_1 = __importDefault(require("../models/Clients.models"));
const DateList_models_1 = __importDefault(require("../models/DateList.models"));
const Barbero_models_1 = __importDefault(require("../models/Barbero.models"));
const Trabajo_models_1 = __importDefault(require("../models/Trabajo.models"));
// ====================== CITAS ======================
const getDates = async (req, res) => {
    try {
        const dates = await DateList_models_1.default.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["updatedAt"] },
            include: [Clients_models_1.default]
        });
        res.json({ data: dates });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las citas" });
    }
};
exports.getDates = getDates;
const createDate = async (req, res) => {
    try {
        const newDate = await DateList_models_1.default.create(req.body);
        res.status(201).json({ message: "Cita creada correctamente", data: newDate });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear la cita" });
    }
};
exports.createDate = createDate;
const getDateById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await DateList_models_1.default.findByPk(id);
        if (!service)
            return res.status(404).json({ error: "Cita no encontrada" });
        res.json({ data: service });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno" });
    }
};
exports.getDateById = getDateById;
const UpdateDate = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await DateList_models_1.default.findByPk(id);
        if (!service)
            return res.status(404).json({ error: "Cita no encontrada" });
        await service.update(req.body);
        res.json({ data: service });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar" });
    }
};
exports.UpdateDate = UpdateDate;
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await DateList_models_1.default.findByPk(id);
        if (!service)
            return res.status(404).json({ error: "Cita no encontrada" });
        service.isPaid = !service.isPaid;
        await service.save();
        res.json({ data: service });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar estado" });
    }
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const deleteDate = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await DateList_models_1.default.findByPk(id);
        if (!service)
            return res.status(404).json({ error: "Cita no encontrada" });
        await service.destroy();
        res.json({ data: "Cita eliminada" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar" });
    }
};
exports.deleteDate = deleteDate;
// ====================== BARBEROS (Usando modelo correcto) ======================
const getBarberos = async (req, res) => {
    try {
        const barberos = await Barbero_models_1.default.findAll({
            order: [["nombre", "ASC"]]
        });
        res.json({ data: barberos });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener barberos" });
    }
};
exports.getBarberos = getBarberos;
const addBarbero = async (req, res) => {
    try {
        const { nombre, foto } = req.body;
        if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        const existe = await Barbero_models_1.default.findOne({ where: { nombre: nombre.trim() } });
        if (existe) {
            return res.status(409).json({ error: "Ya existe un barbero con ese nombre" });
        }
        const nuevo = await Barbero_models_1.default.create({
            nombre: nombre.trim(),
            foto: foto?.trim() ?? null
        });
        res.status(201).json({ success: true, data: nuevo });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al agregar barbero" });
    }
};
exports.addBarbero = addBarbero;
const getBarberAvailability = async (req, res) => {
    try {
        const { barber } = req.params;
        const appointments = await DateList_models_1.default.findAll({
            where: {
                barber: { [sequelize_1.Op.iLike]: `%${barber.trim()}%` }
            },
            attributes: ['dateList']
        });
        const busySlots = appointments.map(app => ({
            dateList: app.dataValues.dateList,
            duration: 30
        }));
        res.json({ data: busySlots });
    }
    catch (error) {
        console.error("❌ Error en getBarberAvailability:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};
exports.getBarberAvailability = getBarberAvailability;
const saveBarberos = async (req, res) => {
    try {
        const { barberos } = req.body;
        if (!Array.isArray(barberos)) {
            return res.status(400).json({ error: "barberos debe ser un array" });
        }
        const json = JSON.stringify(barberos);
        const existing = await DateList_models_1.default.findOne({
            where: { service: '__barberos__' }
        });
        if (existing) {
            await existing.update({ client: json });
        }
        else {
            await DateList_models_1.default.create({
                service: '__barberos__',
                price: 0,
                barber: '__config__',
                dateList: new Date().toISOString(),
                client: json,
                phone: '__config__',
                duration: 0
            });
        }
        res.json({ data: barberos });
    }
    catch (error) {
        console.error("Error saveBarberos:", error);
        res.status(500).json({ error: "Error al guardar barberos" });
    }
};
exports.saveBarberos = saveBarberos;
const updateBarberos = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, foto } = req.body;
        const barbero = await Barbero_models_1.default.findByPk(id);
        if (!barbero)
            return res.status(404).json({ error: "Barbero no encontrado" });
        await barbero.update({
            ...(nombre && { nombre: nombre.trim() }),
            ...(foto !== undefined && { foto: foto?.trim() ?? null })
        });
        res.json({ success: true, data: barbero });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar barbero" });
    }
};
exports.updateBarberos = updateBarberos;
const deleteBarberos = async (req, res) => {
    try {
        const { id } = req.params;
        const barbero = await Barbero_models_1.default.findByPk(id);
        if (!barbero)
            return res.status(404).json({ error: "Barbero no encontrado" });
        await barbero.destroy();
        res.json({ success: true, message: "Barbero eliminado correctamente" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar barbero" });
    }
};
exports.deleteBarberos = deleteBarberos;
// ====================== TRABAJOS (Cloudinary) ======================
const createWorks = async (req, res) => {
    try {
        const { titulo, descripcion, categoria, barbero, imagen } = req.body;
        if (!imagen)
            return res.status(400).json({ error: "No se recibió imagen" });
        if (!titulo)
            return res.status(400).json({ error: "Título obligatorio" });
        const trabajo = await Trabajo_models_1.default.create({
            titulo,
            descripcion: descripcion || "",
            categoria: categoria || "Cortes",
            tipo: "image",
            url: imagen, // base64 directo
            publicId: null,
            barbero: barbero || ""
        });
        res.json({ data: trabajo });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear trabajo" });
    }
};
exports.createWorks = createWorks;
const getWorks = async (req, res) => {
    try {
        const trabajos = await Trabajo_models_1.default.findAll({ order: [["createdAt", "DESC"]] });
        res.json({ data: trabajos });
    }
    catch (error) {
        res.status(500).json({ error: "Error al obtener trabajos" });
    }
};
exports.getWorks = getWorks;
const deleteWorks = async (req, res) => {
    try {
        const trabajo = await Trabajo_models_1.default.findByPk(req.params.id);
        if (!trabajo)
            return res.status(404).json({ error: "No encontrado" });
        await trabajo.destroy();
        res.json({ data: "Eliminado" });
    }
    catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
};
exports.deleteWorks = deleteWorks;
//# sourceMappingURL=date.js.map