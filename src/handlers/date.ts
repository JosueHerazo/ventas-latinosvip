
import {Request, Response} from "express"
import Datelist from "../models/DateList.models"


export const getProducts = async (req: Request, res: Response) => {
    try {
        const dateslist = await Datelist.findAll({
            order: [
                ["createdAt", "DESC"]
            ],
            attributes: {exclude: ["updatedAt", ]}, 
            
        })
        res.json({ data: dateslist })
    } catch (error) {
        console.log(error)
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const dateslist = await Datelist.create(req.body)
        res.status(201).json({ data: dateslist })
    } catch (error) {
        console.log(error)
    }
}

// Agrega los demás (deleteProduct, getProductById, etc.) aunque estén vacíos por ahora
export const deleteProduct = async (req: Request, res: Response) => {}
export const getProductById = async (req: Request, res: Response) => {}
// En tu controlador de Express (Sugerencia)
export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const appointment = await Datelist.findByPk(id);
        if (appointment) {
            // Cambiamos el estado a pagado
            await appointment.update({ isPaid: true }); 
            appointment.save()
            res.json({ data: appointment });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar' });
    }
}
export const UpdateProduct = async (req: Request, res: Response) => {}