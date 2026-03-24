import { Request, Response } from 'express'
import Client from '../models/Clients.models'
import Datelist from '../models/DateList.models'

import { validationResult } from 'express-validator/lib'
import { Op } from 'sequelize'
import { v2 as cloudinary } from 'cloudinary'



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const getProducts = async (req: Request, res: Response) => {
    try {
        const ListDate = await Datelist.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["updatedAt"] },
            include: [Client]
        })
        res.json({ data: ListDate })
    } catch (error) {
        console.log(error)
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        console.log("Body recibido en POST /api/date:", req.body)
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log("❌ Errores de validación:", errors.array())
            return res.status(400).json({ errors: errors.array() })
        }
        const dateslist = await Datelist.create(req.body)
        res.status(201).json({ message: "Cita creada correctamente", data: dateslist })
    } catch (error) {
        console.log("🔥 Error en el servidor:", error)
        res.status(500).json({ error: "Error interno" })
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const ListDate = await Datelist.findByPk(id)
        if (!ListDate) return res.status(404).json({ error: "Producto No Encontrado" })
        res.json({ data: ListDate })
    } catch (error) {
        console.log(error)
    }
}

export const UpdateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const ListDate = await Datelist.findByPk(id)
        if (!ListDate) return res.status(404).json({ error: "Producto No Encontrado" })
        await ListDate.update(req.body)
        await ListDate.save()
        res.json({ data: ListDate })
    } catch (error) {
        console.log(error)
    }
}

export const updateAvailability = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const ListDate = await Datelist.findByPk(id)
        if (!ListDate) return res.status(404).json({ error: "Producto No Encontrado" })
        await ListDate.update({ isPaid: !ListDate.dataValues.isPaid })
        res.json({ data: ListDate })
    } catch (error) {
        console.log(error)
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const ListDate = await Datelist.findByPk(id)
        if (!ListDate) return res.status(404).json({ error: "Producto No Encontrado" })
        await ListDate.destroy()
        res.json({ data: "Product Eliminado" })
    } catch (error) {
        console.log(error)
    }
}

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
        res.status(500).json({ error: "Error en el servidor" })
    }
}

export const getBarberos = async (req: Request, res: Response) => {
    try {
        const config = await Datelist.findOne({ where: { service: '__barberos__' } })
        if (!config) {
            return res.json({ data: [
                { id: "1", nombre: "Josue", foto: "" },
                { id: "2", nombre: "Vato",  foto: "" }
            ]})
        }
        const barberos = JSON.parse(config.dataValues.client)
        res.json({ data: barberos })
    } catch (error) {
        res.status(500).json({ error: "Error al obtener barberos" })
    }
}

export const saveBarberos = async (req: Request, res: Response) => {
    try {
        const { barberos } = req.body
        if (!Array.isArray(barberos)) return res.status(400).json({ error: "barberos debe ser un array" })
        const json = JSON.stringify(barberos)
        const existing = await Datelist.findOne({ where: { service: '__barberos__' } })
        if (existing) {
            await existing.update({ client: json })
        } else {
            await Datelist.create({
                service: '__barberos__', price: 0, barber: '__config__',
                dateList: new Date().toISOString(), client: json,
                phone: '__config__', duration: 0
            })
        }
        res.json({ data: barberos })
    } catch (error) {
        res.status(500).json({ error: "Error al guardar barberos" })
    }
}
