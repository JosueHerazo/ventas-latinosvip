"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveServices = exports.archivarSemana = exports.markAsPaid = exports.deleteProduct = exports.updateAvailability = exports.UpdateProduct = exports.getProductById = exports.createProduct = exports.getProducts = void 0;
const service_model_1 = __importDefault(require("../models/service.model"));
const Clients_models_1 = __importDefault(require("../models/Clients.models"));
const WeeklyClosing_1 = __importDefault(require("../models/models/WeeklyClosing"));
const getProducts = async (req, res) => {
    try {
        const service = await service_model_1.default.findAll({
            order: [
                ["createdAt", "DESC"]
            ],
            attributes: { exclude: ["updatedAt",] },
            include: [Clients_models_1.default]
        });
        res.json({ data: service });
    }
    catch (error) {
        console.log(error);
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        const service = await service_model_1.default.create(req.body);
        res.json({ data: service });
    }
    catch (error) {
        console.log(error);
    }
};
exports.createProduct = createProduct;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await service_model_1.default.findByPk(id);
        if (!service) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            });
        }
        // siempre hay que responder la data 
        res.json({ data: service });
    }
    catch (error) {
        console.log(error);
    }
};
exports.getProductById = getProductById;
const UpdateProduct = async (req, res) => {
    try {
        // primero se busca el ID del producto o el mismo producto
        const { id } = req.params;
        // const id = req.params.id
        // luego se busca el peoducto por id
        const date = await service_model_1.default.findByPk(id);
        //    super importante validar que haya producto
        if (!date) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            });
            //Actulizar
        }
        // el producto que esta en el body o en el formulario lo actuliza con este codigo  y luego
        // put reemplza el elemento con lo que le envies, si no usa el update a diferencia de patch
        await date.update(req.body);
        // se guarda el dateo actualizado
        await date.save();
        res.json({ data: date });
    }
    catch (error) {
        console.log(error);
    }
};
exports.UpdateProduct = UpdateProduct;
const updateAvailability = async (req, res) => {
    try {
        // primero se busca el ID del producto o el mismo producto
        const { id } = req.params;
        // const id = req.params.id
        // luego se busca el peoducto por id
        const date = await service_model_1.default.findByPk(id);
        //    super importante validar que haya producto
        if (!date) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            });
            //Actulizar
        }
        // el producto que esta en el body o en el formulario lo actuliza con este codigo  y luego
        // este codigo toma la informacion del body pero queremos que sea mas sencillo entonces se usa el datavalue
        //  product.availability = req.body.availability
        // el data value toma el objeto y se toma una parte del objeto  en este caso se toma lo contrario del objeto es decir si es true que lo envie como false 
        //  product.availability = !product.dataValues.availability
        // se guarda el producto actualizado
        await date.save();
        console.log();
        res.json({ data: date });
    }
    catch (error) {
        console.log(error);
    }
};
exports.updateAvailability = updateAvailability;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const date = await service_model_1.default.findByPk(id);
        if (!date) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            });
        }
        await date.destroy();
        // siempre hay que responder la data 
        res.json({ data: "Product Eliminado" });
    }
    catch (error) {
        console.log(error);
    }
};
exports.deleteProduct = deleteProduct;
// En tu controlador de Express
// 1. Marcar una cita como pagada (Liquidar cobro individual)
const markAsPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await service_model_1.default.findByPk(id);
        if (!service) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }
        // Marcamos como pagado
        service.isPaid = true;
        await service.save();
        res.json({ data: service });
    }
    catch (error) {
        res.status(500).json({ error: "Error al procesar el pago" });
    }
};
exports.markAsPaid = markAsPaid;
// 2. Archivar la semana (Cierre total del barbero)
const archivarSemana = async (req, res) => {
    try {
        const { barbero, totalBruto, comision50, serviciosArchivados } = req.body;
        if (!barbero || !Array.isArray(serviciosArchivados) || serviciosArchivados.length === 0) {
            return res.status(400).json({
                error: "Faltan datos: barbero y serviciosArchivados son requeridos"
            });
        }
        // Create historical record
        await WeeklyClosing_1.default.create({
            barber: barbero,
            totalGross: Number(totalBruto),
            commission: Number(comision50),
            servicesCount: serviciosArchivados.length,
            archivedServiceIds: serviciosArchivados.join(',')
        });
        // Archive the services
        await service_model_1.default.update({ isArchived: true }, {
            where: { id: serviciosArchivados }
        });
        res.json({
            message: "Cierre de semana realizado con éxito",
            barbero,
            totalBruto,
            comision50
        });
    }
    catch (error) {
        console.error("Error en archivarSemana:", error);
        res.status(500).json({
            error: "Error al archivar la semana",
            details: error.message
        });
    }
};
exports.archivarSemana = archivarSemana;
// En tu controlador de servicios (ej. getServices)
const getActiveServices = async (req, res) => {
    const services = await service_model_1.default.findAll({
        where: {
            isPaid: false // <--- CLAVE: Solo traemos lo que NO se ha pagado aún
        },
        order: [['createdAt', 'DESC']]
    });
    res.json(services);
};
exports.getActiveServices = getActiveServices;
// // // export const getProduct = async (req: Request, res:Response) =>{
// // //     const products = Product.findAll(req.body)
// // //     res.json(products)
// // //     res.json("Desde GET products")
// // // 
// src/handlers/date.ts
//# sourceMappingURL=service.js.map