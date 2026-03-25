import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { Op } from 'sequelize'

// ==================== MODELOS ====================
import Datelist from '../models/DateList.models'
import Client from '../models/Clients.models'
import Barbero from '../models/Barbero.models'

// ====================== CRUD DE CITAS ======================

export const getDates = async (req: Request, res: Response) => {
    try {
        const dates = await Datelist.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["updatedAt"] },
            include: [Client]
        })
        res.json({ data: dates })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al obtener las citas" })
    }
}

export const createDate = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const newDate = await Datelist.create(req.body)
        res.status(201).json({ message: "Cita creada correctamente", data: newDate })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al crear la cita" })
    }
}

export const getDateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const appointment = await Datelist.findByPk(id)
        if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' })
        res.json({ data: appointment })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error interno" })
    }
}

export const UpdateDate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const appointment = await Datelist.findByPk(id)
        if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' })

        await appointment.update(req.body)
        res.json({ data: appointment })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al actualizar" })
    }
}

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const appointment = await Datelist.findByPk(id)
        if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' })

        appointment.isPaid = !appointment.dataValues.isPaid
        await appointment.save()
        res.json({ data: appointment })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al actualizar estado" })
    }
}

export const deleteDate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const appointment = await Datelist.findByPk(id)
        if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' })

        await appointment.destroy()
        res.json({ data: 'Cita eliminada correctamente' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al eliminar" })
    }
}

// ====================== BARBEROS ======================

export const getBarberos = async (req: Request, res: Response) => {
    try {
        const barberos = await Barbero.findAll({
            order: [["nombre", "ASC"]]
        })
        res.json({ data: barberos })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al obtener barberos" })
    }
}

// POST /barberos — agrega UN barbero con nombre y foto
export const addBarbero = async (req: Request, res: Response) => {
    try {
        const { nombre, foto } = req.body

        if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre es obligatorio" })
        }

        const existe = await Barbero.findOne({
            where: { nombre: nombre.trim() }
        })
        if (existe) {
            return res.status(409).json({ error: "Ya existe un barbero con ese nombre" })
        }

        const nuevo = await Barbero.create({
            nombre: nombre.trim(),
            foto: foto?.trim() ?? null
        })

        res.status(201).json({ success: true, data: nuevo })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al agregar barbero" })
    }
}

// PUT /barberos/:id — edita nombre o foto de un barbero existente
export const updateBarbero = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { nombre, foto } = req.body

        const barbero = await Barbero.findByPk(id)
        if (!barbero) return res.status(404).json({ error: "Barbero no encontrado" })

        await barbero.update({
            ...(nombre && { nombre: nombre.trim() }),
            ...(foto !== undefined && { foto: foto?.trim() ?? null })
        })

        res.json({ success: true, data: barbero })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al actualizar barbero" })
    }
}

// DELETE /barberos/:id — elimina un barbero por id
export const deleteBarbero = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const barbero = await Barbero.findByPk(id)
        if (!barbero) return res.status(404).json({ error: "Barbero no encontrado" })

        await barbero.destroy()
        res.json({ success: true, message: "Barbero eliminado correctamente" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al eliminar barbero" })
    }
}

// ====================== DISPONIBILIDAD ======================

export const getBarberAvailability = async (req: Request, res: Response) => {
    try {
        const { barber } = req.params

        const appointments = await Datelist.findAll({
            where: {
                barber: { [Op.iLike]: `%${barber.trim()}%` }
            },
            attributes: ['dateList']
        })

        const busySlots = appointments.map(app => ({
            dateList: app.dataValues.dateList,
            duration: 30
        }))

        res.json({ data: busySlots })
    } catch (error) {
        console.error("❌ Error en getBarberAvailability:", error)
        res.status(500).json({ error: "Error en el servidor" })
    }
}