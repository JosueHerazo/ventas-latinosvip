import express from "express"
import colors from "colors"
import cors, {CorsOptions} from "cors"
import morgan from "morgan"
import router from "./router"
import db from "./config/db"


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

// const whitelist = [
//   process.env.FRONTEND_URL, 
//   process.env.FRONTEND_URL_DATE,
  
// ];

const corsOptions: CorsOptions = {
  origin: function(origin, callback) {
    // Si el origen está en la lista o no existe (como Postman)
    if (!origin || process.env.FRONTEND_URL.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Acceso denegado por CORS para:", origin);
      callback(new Error("No permitido por CORS"));
    }
  }
};

server.use(cors(corsOptions))
server.use(express.json())

server.use(morgan("dev"))



 server.use("/api/service", router)

 

 export default server

