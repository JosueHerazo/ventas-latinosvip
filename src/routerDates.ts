import { Router } from "express"
import { body, param } from "express-validator"
import { handlerInputErrors } from "./middleware"

// Handlers de citas y barberos
import {
    getDates,
    createDate,
    getDateById,
    UpdateDate,
    updateAppointmentStatus,
    deleteDate,
    getBarberos,
    saveBarberos,
    getBarberAvailability,
} from "./handlers/date"

// Handlers de trabajos
import { getWorks, createWorks, deleteWorks } from "./handlers/works.Handlers"
import { uploadWork } from "./config/cloudinaryWorks"

const router = Router()

// ====================== RUTAS ESPECÍFICAS (DEBEN IR ANTES DE :id) ======================

// Barberos
router.get("/barberos", getBarberos)
router.post("/barberos", 
    body("barberos").isArray().withMessage("Debe ser un array de barberos"),
    handlerInputErrors, 
    saveBarberos
)

// Availability
router.get("/availability/:barber", 
    param("barber").notEmpty().withMessage("Barbero requerido").trim(),
    handlerInputErrors, 
    getBarberAvailability
)

// Trabajos (Works) - Esta ruta debe ir ANTES de :id
router.get("/works", getWorks)
router.post("/works", uploadWork.single("archivo"), createWorks)
router.delete("/works/:id", 
    param("id").isInt().withMessage("ID no válido"),
    handlerInputErrors, 
    deleteWorks
)

// ====================== CRUD DE CITAS ======================

router.get("/", getDates)

router.post("/", 
    body("service").notEmpty().withMessage("El servicio es requerido"),
    body("price").notEmpty().isNumeric().custom(v => parseFloat(v) >= 0),
    body("barber").isString().notEmpty().trim(),
    body("dateList").notEmpty(),
    body("client").notEmpty(),
    body("phone").notEmpty(),
    body("duration").isNumeric().notEmpty(),
    handlerInputErrors,
    createDate
)

// Rutas con :id → SIEMPRE AL FINAL
router.get("/:id",   param("id").isInt().withMessage("ID no válido"), handlerInputErrors, getDateById)
router.put("/:id",   param("id").isInt().withMessage("ID no válido"), handlerInputErrors, UpdateDate)
router.patch("/:id", param("id").isInt().withMessage("ID no válido"), handlerInputErrors, updateAppointmentStatus)
router.delete("/:id",param("id").isInt().withMessage("ID no válido"), handlerInputErrors, deleteDate)

export default router