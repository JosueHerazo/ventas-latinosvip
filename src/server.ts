import express from "express"
import colors from "colors"
import cors, {CorsOptions} from "cors"
import morgan from "morgan"
import router from "./router"
import db from "./config/db"
import routerDates from "./routerDates"


async function connectDB() {
    try {
        await db.authenticate()
        db.sync({alter: true})
        console.log(colors.bgBlue.white.bold("Conexion exitosa a la DB"))
        
    } catch (error) {
        console.log(error);
        console.log(colors.bgRed.white("Hubo un error al conectar a la DB"));
        
        
    }
}

connectDB()
 const server = express()



const whitelist = [
  process.env.FRONTEND_URL,
  "https://ventas-latinosvip-frontend-nu.vercel.app" ,
 
process.env.FRONTEND_URL_DATE,"https://citas-frontend-njc4.vercel.app"
]; 

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    // Si quieres que funcione SÍ O SÍ ahora mismo:
    callback(null, true); 
  }
};


server.use(cors(corsOptions))
server.use(express.json())
server.use(morgan("dev"))
 server.use("/api/service", router)
 server.use("/api/date", routerDates)

 

 export default server

