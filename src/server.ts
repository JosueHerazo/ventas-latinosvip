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

// const corsOptions: CorsOptions = {
//   origin: function(origin, callback) {
//     // Si el origen está en la lista o no existe (como Postman)
//     if (!origin || whitelist.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log("Acceso denegado por CORS para:", origin);
//       callback(new Error("No permitido por CORS"));
//     }
//   }
// };

// server.use(cors(corsOptions));
// server.use(cors({
//   origin: "http://localhost:5173"
// }))

server.use(cors(corsOptionsDate))
//Leer datos de formulario del  req.body
server.use(express.json())

server.use(morgan("dev"))

// use es un metodo que usa express para interactuar sobre los los metodos http del router
// <<<<<<< HEAD
//  server.use("/cita/cliente", router)

 server.use("/api/service", router)

 

 export default server

