import express from "express"
import cors, { CorsOptions } from "cors"
import morgan from "morgan"
import router from "./router"
import db from "./config/db"
import routerDates from "./routerDates"
import routerConfig from "./routerConfig"  // ← AÑADIR

async function connectDB() {
    try {
        await db.authenticate()
        db.sync()
        console.log("Conexion exitosa a la DB")
    } catch (error) {
        console.log("Hubo un error al conectar a la DB");
    }
}
connectDB()

const server = express()

const whitelist = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_DATE,
];

const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("Error de CORS: Origen no permitido"))
        }
    }
}

server.use(cors(corsOptions))
server.use(express.json({ limit: "10mb" }))  // ← limit para fotos base64
server.use(morgan("dev"))

server.use("/api/service", router)
server.use("/api/date",    routerDates)
server.use("/api/config",  routerConfig)  // ← AÑADIR

export default server