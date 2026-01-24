"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
// import Client from "../models/Clients.models"
// import Service from "../models/Date.models"
dotenv_1.default.config();
// console.log(process.env.DATABASE_URL);
const db = new sequelize_typescript_1.Sequelize(process.env.DATABASE_URL, {
    // EL ERROR ESTABA AQUÍ: Los corchetes después de la coma estaban mal puestos
    models: [__dirname + "/../models/**/*.ts"],
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});
// const db = new Sequelize(process.env.
// DATABASE_URL!, {
//     models: [ Date, Client] [__dirname + "/../models/**/*"],
//     logging: false
// })
exports.default = db;
//# sourceMappingURL=db.js.map