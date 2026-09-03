import { Request, Response } from "express";
import { Op } from "sequelize";
import Client from "../models/Clients.models";


export const searchClients = async (req: Request, res: Response) => {
  try {
    const { q } = req.query; // El término de búsqueda
    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { phone: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: 5
    });
    res.json({ data: clients });
  } catch (error) {
    res.status(500).json({ error: "Error al buscar clientes" });
  }
};