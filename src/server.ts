import express from "express"
import colors from "colors"
import cors, {CorsOptions} from "cors"
import morgan from "morgan"
import router from "./router"
import db from "./config/db"


// conectar a base de datos
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
//instancia de express
 const server = express()
const whitelist = [process.env.FRONTEND_URL_DATE, process.env.FRONTEND_URL];
const corsOptionsDate : CorsOptions = {
    origin: function(origin, callback)  {
       if(!origin || whitelist.includes(origin)){
        console.log(origin);
        callback(null, true)
    }else{
           console.log("denegar", origin);
        callback(null, false )        
       }
    }
}
// server.use(cors({
//   origin: "http://localhost:5173"
// }))

server.use(cors(corsOptionsDate))
//Leer datos de formulario del  req.body
server.use(express.json())

server.use(morgan("dev"))

// use es un metodo que usa express para interactuar sobre los los metodos http del router
 server.use("/cita/cliente", router)

 export default server

