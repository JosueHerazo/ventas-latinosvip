"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const router_1 = __importDefault(require("./router"));
const db_1 = __importDefault(require("./config/db"));
const routerDates_1 = __importDefault(require("./routerDates"));
async function connectDB() {
    try {
        await db_1.default.authenticate();
        db_1.default.sync(); // Sincroniza los modelos con la base de datos
        console.log("Conexion exitosa a la DB");
    }
    catch (error) {
        console.log("Hubo un error al conectar a la DB");
    }
}
connectDB();
const server = (0, express_1.default)();
// Configuración de CORS Robusta
const whitelist = [
    process.env.FRONTEND_URL, // Asegúrate que en Render esto sea https://ventas-latinosvip-frontend-nu.vercel.app
    process.env.FRONTEND_URL_DATE,
    // "https://localhost:5173"
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Error de CORS: Origen no permitido"));
        }
    }
};
server.use((0, cors_1.default)(corsOptions));
server.use(express_1.default.json());
server.use((0, morgan_1.default)("dev"));
server.use("/api/service", router_1.default);
server.use("/api/date", routerDates_1.default);
exports.default = server;
//# sourceMappingURL=server.js.map