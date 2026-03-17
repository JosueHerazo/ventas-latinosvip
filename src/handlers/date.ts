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
        if (!service) {
            return res.status(404).json({ error: "Cita no encontrada" })
        }
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const UpdateDate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const service = await Datelist.findByPk(id)
        if (!service) {
            return res.status(404).json({ error: "Cita no encontrada" })
        }
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
        if (!service) {
            return res.status(404).json({ error: "Cita no encontrada" })
        }
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
        if (!service) {
            return res.status(404).json({ error: "Cita no encontrada" })
        }
        await service.destroy()
        res.json({ data: "Cita eliminada" })
    } catch (error) {
        console.log(error)
    }
}

// ✅ NUEVO — disponibilidad por barbero
export const getBarberAvailability = async (req: Request, res: Response) => {
    try {
        const { barber } = req.params
        const appointments = await Datelist.findAll({
            where: { barber: { [Op.iLike]: barber.trim() } },
            attributes: ['dateList', 'duration']
        })
        const busySlots = appointments.map(app => ({
            dateList: app.dataValues.dateList,
            duration: app.dataValues.duration || 30
        }))
        res.json({ data: busySlots })
    } catch (error) {
        console.error("Error getBarberAvailability:", error)
        res.status(500).json({ error: "Error en el servidor" })
    }
}