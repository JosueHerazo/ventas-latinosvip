import { Request, Response } from "express"
import { Op } from "sequelize"
import Datelist from "../models/DateList.models"
import Client from "../models/Clients.models"

export const getDates = async (req: Request, res: Response) => {
    try {
        const service = await Datelist.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["updatedAt"] },
            include: [Client]
        })
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const createDate = async (req: Request, res: Response) => {
    try {
        const { barber, dateList } = req.body
        const existing = await Datelist.findOne({
            where: { barber, dateList }
        })
        if (existing) {
            return res.status(400).json({
                error: "Ese horario ya está ocupado para este barbero"
            })
        }
        const service = await Datelist.create(req.body)
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const getDateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const service = await Datelist.findByPk(id)
        if (!service) return res.status(404).json({ error: "Cita no encontrada" })
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const UpdateDate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const service = await Datelist.findByPk(id)
        if (!service) return res.status(404).json({ error: "Cita no encontrada" })
        await service.update(req.body)
        await service.save()
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const service = await Datelist.findByPk(id)
        if (!service) return res.status(404).json({ error: "Cita no encontrada" })
        await service.update({ isPaid: !service.dataValues.isPaid })
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const deleteDate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const service = await Datelist.findByPk(id)
        if (!service) return res.status(404).json({ error: "Cita no encontrada" })
        await service.destroy()
        res.json({ data: "Cita eliminada" })
    } catch (error) {
        console.log(error)
    }
}

export const getBarberAvailability = async (req: Request, res: Response) => {
    try {
        const { barber } = req.params
        const appointments = await Datelist.findAll({
            where: { barber: { [Op.iLike]: barber.trim() } },
            attributes: ['dateList']
        })
        const busySlots = appointments.map(app => ({
            dateList: app.dataValues.dateList,
            duration: 30
        }))
        res.json({ data: busySlots })
    } catch (error) {
        console.error("Error getBarberAvailability:", error)
        res.status(500).json({ error: "Error en el servidor" })
    }
}

// ── Barberos guardados como JSON en tabla dates ───────────────
export const getBarberos = async (req: Request, res: Response) => {
    try {
        const config = await Datelist.findOne({
            where: { service: '__barberos__' }
        })
        if (!config) {
            return res.json({ data: [
                { id: "josue", nombre: "Josue", foto: "" },
                { id: "vato",  nombre: "Vato",  foto: "" }
            ]})
        }
        const barberos = JSON.parse(config.dataValues.client)
        res.json({ data: barberos })
    } catch (error) {
        console.error("Error getBarberos:", error)
        res.status(500).json({ error: "Error al obtener barberos" })
    }
}

export const saveBarberos = async (req: Request, res: Response) => {
    try {
        const { barberos } = req.body
        if (!Array.isArray(barberos)) {
            return res.status(400).json({ error: "barberos debe ser un array" })
        }
        const json = JSON.stringify(barberos)

        const existing = await Datelist.findOne({
            where: { service: '__barberos__' }
        })

        if (existing) {
            await existing.update({ client: json })
        } else {
            await Datelist.create({
                service:  '__barberos__',
                price:    0,
                barber:   '__config__',
                dateList: new Date().toISOString(),
                client:   json,
                phone:    '__config__',
                duration: 0
            })
        }
        res.json({ data: barberos })
    } catch (error) {
        console.error("Error saveBarberos:", error)
        res.status(500).json({ error: "Error al guardar barberos" })
    }
}