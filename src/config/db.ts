import {Sequelize} from "sequelize-typescript"
import dotenv from "dotenv"
// import Client from "../models/Clients.models"
// import Service from "../models/Date.models"
import Date from "../models/Date.models"
import Client from "../models/Clients.models"
dotenv.config()
 
// console.log(process.env.DATABASE_URL);
const db = new Sequelize(process.env.DATABASE_URL!, {
    // EL ERROR ESTABA AQUÍ: Los corchetes después de la coma estaban mal puestos
    models: [Date, Client], 
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Necesario para Render/PostgreSQL
        }
    }
});

// const db = new Sequelize(process.env.
// DATABASE_URL!, {
//     models: [ Date, Client] [__dirname + "/../models/**/*"],
//     logging: false
// })

export default db