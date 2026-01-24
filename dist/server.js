"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const colors_1 = __importDefault(require("colors"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const router_1 = __importDefault(require("./router"));
const db_1 = __importDefault(require("./config/db"));
async function connectDB() {
    try {
        await db_1.default.authenticate();
        db_1.default.sync({ alter: true });
        console.log(colors_1.default.bgBlue.white.bold("Conexion exitosa a la DB"));
    }
    catch (error) {
        console.log(error);
        console.log(colors_1.default.bgRed.white("Hubo un error al conectar a la DB"));
    }
}
connectDB();
const server = (0, express_1.default)();
// const whitelist = [
//   process.env.FRONTEND_URL, 
//   process.env.FRONTEND_URL_DATE,
// ];
const corsOptions = {
    origin: function (origin, callback) {
        // Si el origen está en la lista o no existe (como Postman)
        if (!origin || process.env.FRONTEND_URL.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log("Acceso denegado por CORS para:", origin);
            callback(new Error("No permitido por CORS"));
        }
    }
};
server.use((0, cors_1.default)(corsOptions));
server.use(express_1.default.json());
server.use((0, morgan_1.default)("dev"));
server.use("/api/service", router_1.default);
exports.default = server;
//# sourceMappingURL=server.js.map