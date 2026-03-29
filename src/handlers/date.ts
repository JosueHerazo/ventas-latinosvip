// src/handlers/date.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import Client from "../models/Clients.models";
import DateList from "../models/DateList.models";
import Barbero from "../models/Barbero.models";
import Trabajo from "../models/Trabajo.models";
import { cloudinary } from "../config/cloudinaryWorks";

// ====================== CITAS ======================
export const getDates = async (req: Request, res: Response) => {
    try {
        const dates = await DateList.findAll({
            order: [["createdAt", "DESC"]],
            attributes: { exclude: ["updatedAt"] },
            include: [Client]
        });
        res.json({ data: dates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener las citas" });
    }
};

export const createDate = async (req: Request, res: Response) => {
    try {
        const newDate = await DateList.create(req.body);
        res.status(201).json({ message: "Cita creada correctamente", data: newDate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear la cita" });
    }
};
export const getDateById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const service = await DateList.findByPk(id);
        if (!service) return res.status(404).json({ error: "Cita no encontrada" });
        res.json({ data: service });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno" });
    }
};

export const UpdateDate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const service = await DateList.findByPk(id);
        if (!service) return res.status(404).json({ error: "Cita no encontrada" });
        await service.update(req.body);
        res.json({ data: service });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar" });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const service = await DateList.findByPk(id);
        if (!service) return res.status(404).json({ error: "Cita no encontrada" });
        service.isPaid = !service.isPaid;
        await service.save();
        res.json({ data: service });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar estado" });
    }
};

export const deleteDate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const service = await DateList.findByPk(id);
        if (!service) return res.status(404).json({ error: "Cita no encontrada" });
        await service.destroy();
        res.json({ data: "Cita eliminada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al eliminar" });
    }
};

// ====================== BARBEROS (Usando modelo correcto) ======================
export const getBarberos = async (req: Request, res: Response) => {
    try {
        const barberos = await Barbero.findAll({
            order: [["nombre", "ASC"]]
        });
        res.json({ data: barberos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener barberos" });
    }
};

export const addBarbero = async (req: Request, res: Response) => {
    try {
        const { nombre, foto } = req.body;

        if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        const existe = await Barbero.findOne({ where: { nombre: nombre.trim() } });
        if (existe) {
            return res.status(409).json({ error: "Ya existe un barbero con ese nombre" });
        }

        const nuevo = await Barbero.create({
            nombre: nombre.trim(),
            foto: foto?.trim() ?? null
        });

        res.status(201).json({ success: true, data: nuevo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al agregar barbero" });
    }
};

export const getBarberAvailability = async (req: Request, res: Response) => {
    try {
        const { barber } = req.params

        const appointments = await DateList.findAll({
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

export const saveBarberos = async (req: Request, res: Response) => {
    try {
        const { barberos } = req.body;
        if (!Array.isArray(barberos)) {
            return res.status(400).json({ error: "barberos debe ser un array" });
        }

        const json = JSON.stringify(barberos);

        const existing = await DateList.findOne({
            where: { service: '__barberos__' }
        });

        if (existing) {
            await existing.update({ client: json });
        } else {
            await DateList.create({
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
    } catch (error) {
        console.error("Error saveBarberos:", error);
        res.status(500).json({ error: "Error al guardar barberos" });
    }
};
export const updateBarberos = async (req: Request, res: Response) => {
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
export const deleteBarberos = async (req: Request, res: Response) => {
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
// ====================== TRABAJOS (Cloudinary) ======================
export const createWorks = async (req: Request, res: Response) => {
    try {
        const file = req.file as Express.Multer.File;
        if (!file) {
            return res.status(400).json({ error: "No se recibió ningún archivo" });
        }

        const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: "auto", folder: "trabajos" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(file.buffer);
        });

        const trabajo = await Trabajo.create({
            titulo: req.body.titulo || "Sin título",
            descripcion: req.body.descripcion || "",
            categoria: req.body.categoria || "general",
            tipo: result.resource_type,
            url: result.secure_url,
            publicId: result.public_id,
            barbero: req.body.barbero || "Sin asignar"
        });

        res.json({ success: true, data: trabajo });
    } catch (error: any) {
        console.error("Error en createWorks:", error);
        res.status(500).json({ error: "Error al subir el trabajo", details: error.message });
    }
};

export const getWorks = async (req: Request, res: Response) => {
    try {
        const trabajos = await Trabajo.findAll({ order: [["createdAt", "DESC"]] });
        res.json({ data: trabajos });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener trabajos" });
    }
};

export const deleteWorks = async (req: Request, res: Response) => {
    try {
        const trabajo = await Trabajo.findByPk(req.params.id);
        if (!trabajo) return res.status(404).json({ error: "No encontrado" });

        if (trabajo.publicId) {
            await cloudinary.uploader.destroy(trabajo.publicId, {
                resource_type: trabajo.tipo === "video" ? "video" : "image"
            });
        }

        await trabajo.destroy();
        res.json({ data: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
};