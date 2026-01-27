import express from "express"
import cors, { CorsOptions } from "cors"
import morgan from "morgan"
import router from "./router"
import db from "./config/db"
import routerDates from "./routerDates"

async function connectDB() {
    try {
        await db.authenticate()
        db.sync({alter: true})
        console.log("Conexion exitosa a la DB")
    } catch (error) {
        console.log("Hubo un error al conectar a la DB");
    }
}
connectDB()

const server = express()

// Configuración de CORS Robusta
const whitelist = [
    process.env.FRONTEND_URL, // Asegúrate que en Render esto sea https://ventas-latinosvip-frontend-nu.vercel.app
    process.env.FRONTEND_URL_DATE,
    undefined // Permite herramientas de testing
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
server.use(express.json())
server.use(morgan("dev"))

server.use("/api/service", router)
server.use("/api/date", routerDates)

export default server