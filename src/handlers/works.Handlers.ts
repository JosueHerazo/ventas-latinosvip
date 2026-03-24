import { Request, Response } from "express"
import Trabajo from "../models/Trabajo.models"
import {cloudinary} from "../config/cloudinaryWorks"

export const createWorks = async (req: Request, res: Response) => {
    try {
        const file = req.file as Express.Multer.File

        if (!file) {
            return res.status(400).json({ error: "No file" })
        }

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: "auto", folder: "trabajos" },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(file.buffer)
        })

        const trabajo = await Trabajo.create({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            categoria: req.body.categoria,
            tipo: result.resource_type,
            url: result.secure_url,
            publicId: result.public_id,
            barbero: req.body.barbero
        })

        res.json({ data: trabajo })

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error al crear trabajo" })
    }
}
// GET
export const getWorks = async (req: Request, res: Response) => {
    try {
        const trabajos = await Trabajo.findAll({
            order: [["createdAt", "DESC"]]
        })
        res.json({ data: trabajos })
    } catch (error) {
        res.status(500).json({ error: "Error al obtener trabajos" })
    }
}

// POST


// DELETE
export const deleteWorks = async (req: Request, res: Response) => {
    try {
        const trabajo = await Trabajo.findByPk(req.params.id)

        if (!trabajo) {
            return res.status(404).json({ error: "No encontrado" })
        }

        if (trabajo.publicId) {
            await cloudinary.uploader.destroy(trabajo.publicId, {
                resource_type: trabajo.tipo === "video" ? "video" : "image"
            })
        }

        await trabajo.destroy()

        res.json({ data: "Eliminado" })
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" })
    }
}