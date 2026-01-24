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
const whitelist = [
  "https://ventas-latinosvip-frontend-nu.vercel.app", // Tu URL actual
  "https://citas-frontend-njc4.vercel.app",
  "http://localhost:5173" // Para desarrollo local
];

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Error de CORS: Origen no permitido"));
    }
  }
};


server.use(cors(corsOptions))
server.use(express.json())

server.use(morgan("dev"))



 server.use("/api/service", router)

 

 export default server

