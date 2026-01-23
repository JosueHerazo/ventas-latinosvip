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

const corsOptionsDate : CorsOptions = {
    origin: function(origin, callback)  {
       if(!origin || process.env.FRONTEND_URL.includes(origin)){
        console.log(origin);
        callback(null, true)
    }else{
           console.log("denegar", origin);
        callback(null, false )        
       }

    }
}


server.use(cors(corsOptionsDate))
server.use(express.json())

server.use(morgan("dev"))



 server.use("/api/service", router)

 

 export default server

