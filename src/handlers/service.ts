import { Request, Response } from 'express'
import Service from '../models/service.model'
import Client from '../models/Clients.models'
import WeeklyClosing from '../models/models/WeeklyClosing'

export const getProducts = async (req: Request, res: Response) => {
    try {
        const service = await Service.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["updatedAt"] },
            include: [Client]
        })
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const service = await Service.create(req.body)
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const service = await Service.findByPk(id)
        if (!service) {
            return res.status(404).json({ error: "Producto No Encontrado" })
        }
        res.json({ data: service })
    } catch (error) {
        console.log(error)
    }
}

export const UpdateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const date = await Service.findByPk(id)
        if (!date) {
            return res.status(404).json({ error: "Producto No Encontrado" })
        }
        await date.update(req.body)
        await date.save()
        res.json({ data: date })
    } catch (error) {
        console.log(error)
    }
}

// ✅ FIX: ahora sí lee isPaid del body y lo aplica
export const updateAvailability = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const date = await Service.findByPk(id)
        if (!date) {
            return res.status(404).json({ error: "Producto No Encontrado" })
        }

        // ✅ Si viene isPaid en el body lo usa, si no, hace toggle
        if (typeof req.body.isPaid === 'boolean') {
            date.isPaid = req.body.isPaid
        } else {
            date.isPaid = !date.dataValues.isPaid
        }

        await date.save()
        res.json({ data: date })
    } catch (error) {
        console.log(error)
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const date = await Service.findByPk(id)
        if (!date) {
            return res.status(404).json({ error: "Producto No Encontrado" })
        }
        await date.destroy()
        res.json({ data: "Producto Eliminado" })
    } catch (error) {
        console.log(error)
    }
}

// ✅ markAsPaid — ruta dedicada /:id/pay
export const markAsPaid = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const service = await Service.findByPk(id)
        if (!service) {
            return res.status(404).json({ error: "Servicio no encontrado" })
        }
        service.isPaid = true
        await service.save()
        res.json({ data: service })
    } catch (error) {
        res.status(500).json({ error: "Error al procesar el pago" })
    }
}

// ✅ FIX: ruta corregida a /cierres (sin /api)
export const archivarSemana = async (req: Request, res: Response) => {
    try {
        const { barbero, totalBruto, comision50, serviciosArchivados } = req.body
        await WeeklyClosing.create({
            barber: barbero,
            totalGross: totalBruto,
            commission: comision50,
            servicesCount: serviciosArchivados.length,
            archivedServiceIds: serviciosArchivados.join(',')
        })
        await Service.update({ isArchived: true }, {
            where: { id: serviciosArchivados }
        })
        res.json({ msg: "Cierre completado con éxito" })
    } catch (error) {
        res.status(500).json({ error: "Error al archivar la semana" })
    }
}

export const getActiveServices = async (req: Request, res: Response) => {
    const services = await Service.findAll({
        where: { isPaid: false },
        order: [['createdAt', 'DESC']]
    })
    res.json(services)
}