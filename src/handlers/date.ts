// src/handlers/date.ts
import { Request, Response } from 'express'
import ListDate from '../models/DateList.models'

export const getProducts = async (req: Request, res: Response) => {
    try {
        const dates = await ListDate.findAll()
        res.json({ data: dates })
    } catch (error) {
        console.log(error)
    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const date = await ListDate.create(req.body)
        res.status(201).json({ data: date })
    } catch (error) {
        console.log(error)
    }
}

// Agrega los demás (deleteProduct, getProductById, etc.) aunque estén vacíos por ahora
export const deleteProduct = async (req: Request, res: Response) => {}
export const getProductById = async (req: Request, res: Response) => {}
export const updateAvailability = async (req: Request, res: Response) => {}
export const UpdateProduct = async (req: Request, res: Response) => {}