"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProduct = exports.updateAvailability = exports.getProductById = exports.deleteProduct = exports.createProduct = exports.getProducts = void 0;
const Date_models_1 = __importDefault(require("../models/Date.models"));
const getProducts = async (req, res) => {
    try {
        const dates = await Date_models_1.default.findAll();
        res.json({ data: dates });
    }
    catch (error) {
        console.log(error);
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        const date = await Date_models_1.default.create(req.body);
        res.status(201).json({ data: date });
    }
    catch (error) {
        console.log(error);
    }
};
exports.createProduct = createProduct;
// Agrega los demás (deleteProduct, getProductById, etc.) aunque estén vacíos por ahora
const deleteProduct = async (req, res) => { };
exports.deleteProduct = deleteProduct;
const getProductById = async (req, res) => { };
exports.getProductById = getProductById;
const updateAvailability = async (req, res) => { };
exports.updateAvailability = updateAvailability;
const UpdateProduct = async (req, res) => { };
exports.UpdateProduct = UpdateProduct;
//# sourceMappingURL=date.js.map