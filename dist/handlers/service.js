"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateAvailability = exports.UpdateProduct = exports.getProductById = exports.createProduct = exports.getProducts = void 0;
const service_model_1 = __importDefault(require("../models/service.model"));
const getProducts = async (req, res) => {
    try {
        const date = await service_model_1.default.findAll({
            order: [
                ["createdAt", "DESC"]
            ],
            attributes: { exclude: ["updatedAt",] }
        });
        res.json({ data: date });
    }
    catch (error) {
        console.log(error);
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        const date = await service_model_1.default.create(req.body);
        res.json({ data: date });
    }
    catch (error) {
        console.log(error);
    }
};
exports.createProduct = createProduct;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const date = await service_model_1.default.findByPk(id);
        if (!date) {
            return res.status(404).json({
                error: "Producto No Encontrado"
            });
        }
        // siempre hay que responder la data 
        res.json({ data: date });
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
// // // export const getProduct = async (req: Request, res:Response) =>{
// // //     const products = Product.findAll(req.body)
// // //     res.json(products)
// // //     res.json("Desde GET products")
// // // 
// src/handlers/date.ts
//# sourceMappingURL=service.js.map