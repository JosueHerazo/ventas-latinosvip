"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchClients = void 0;
const sequelize_1 = require("sequelize");
const Clients_models_1 = __importDefault(require("../models/Clients.models"));
const searchClients = async (req, res) => {
    try {
        const { q } = req.query; // El término de búsqueda
        const clients = await Clients_models_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { name: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { phone: { [sequelize_1.Op.iLike]: `%${q}%` } }
                ]
            },
            limit: 5
        });
        res.json({ data: clients });
    }
    catch (error) {
        res.status(500).json({ error: "Error al buscar clientes" });
    }
};
exports.searchClients = searchClients;
//# sourceMappingURL=clients.js.map