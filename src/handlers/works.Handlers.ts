import { Request, Response } from "express"
import Trabajo from "../models/Trabajo.models"



export const createWorks = async (req: Request, res: Response) => {
    try {
        const { titulo, descripcion, categoria, barbero, imagen } = req.body
        
        if (!imagen) return res.status(400).json({ error: "No se recibió imagen" })
        if (!titulo)  return res.status(400).json({ error: "Título obligatorio" })

        const trabajo = await Trabajo.create({
            titulo,
            descripcion: descripcion || "",
            categoria:   categoria   || "Cortes",
            tipo:        "image",
            url:         imagen,   // base64 directo
            publicId:    null,
            barbero:     barbero   || ""
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


        await trabajo.destroy()

        res.json({ data: "Eliminado" })
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" })
    }
}