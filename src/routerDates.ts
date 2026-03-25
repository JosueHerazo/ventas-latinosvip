import { Router } from "express"
import { body, param } from "express-validator"
import { handlerInputErrors } from "./middleware"

// Importamos solo lo que ya tienes funcionando
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

// Trabajos comentados temporalmente para evitar conflicto
// import { getWorks, createWorks, deleteWorks } from "./handlers/works.Handlers"
// import { uploadWork } from "./config/cloudinaryWorks"

const router = Router()

// ==================== RUTAS ESPECÍFICAS - DEBEN IR ANTES DE :id ====================

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

// ==================== CRUD DE CITAS ====================

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

// RUTAS CON :id → SIEMPRE AL FINAL
router.get("/:id",   param("id").isInt().withMessage("ID no válido"), handlerInputErrors, getDateById)
router.put("/:id",   param("id").isInt().withMessage("ID no válido"), handlerInputErrors, UpdateDate)
router.patch("/:id", param("id").isInt().withMessage("ID no válido"), handlerInputErrors, updateAppointmentStatus)
router.delete("/:id",param("id").isInt().withMessage("ID no válido"), handlerInputErrors, deleteDate)

export default router