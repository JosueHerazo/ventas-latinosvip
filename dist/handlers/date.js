"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBarberAvailability = exports.deleteBarbero = exports.updateBarbero = exports.addBarbero = exports.getBarberos = exports.deleteDate = exports.updateAppointmentStatus = exports.UpdateDate = exports.getDateById = exports.createDate = exports.getDates = void 0;
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
// ==================== MODELOS ====================
const DateList_models_1 = __importDefault(require("../models/DateList.models"));
const Clients_models_1 = __importDefault(require("../models/Clients.models"));
const Barbero_models_1 = __importDefault(require("../models/Barbero.models"));
// ====================== CRUD DE CITAS ======================
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
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
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
        const appointment = await DateList_models_1.default.findByPk(id);
        if (!appointment)
            return res.status(404).json({ error: 'Cita no encontrada' });
        res.json({ data: appointment });
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
        const appointment = await DateList_models_1.default.findByPk(id);
        if (!appointment)
            return res.status(404).json({ error: 'Cita no encontrada' });
        await appointment.update(req.body);
        res.json({ data: appointment });
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
        const appointment = await DateList_models_1.default.findByPk(id);
        if (!appointment)
            return res.status(404).json({ error: 'Cita no encontrada' });
        appointment.isPaid = !appointment.dataValues.isPaid;
        await appointment.save();
        res.json({ data: appointment });
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
        const appointment = await DateList_models_1.default.findByPk(id);
        if (!appointment)
            return res.status(404).json({ error: 'Cita no encontrada' });
        await appointment.destroy();
        res.json({ data: 'Cita eliminada correctamente' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar" });
    }
};
exports.deleteDate = deleteDate;
// ====================== BARBEROS ======================
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
// POST /barberos — agrega UN barbero con nombre y foto
const addBarbero = async (req, res) => {
    try {
        const { nombre, foto } = req.body;
        if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        const existe = await Barbero_models_1.default.findOne({
            where: { nombre: nombre.trim() }
        });
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
// PUT /barberos/:id — edita nombre o foto de un barbero existente
const updateBarbero = async (req, res) => {
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
exports.updateBarbero = updateBarbero;
// DELETE /barberos/:id — elimina un barbero por id
const deleteBarbero = async (req, res) => {
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
exports.deleteBarbero = deleteBarbero;
// ====================== DISPONIBILIDAD ======================
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
//# sourceMappingURL=date.js.map