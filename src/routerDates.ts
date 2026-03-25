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
    addBarbero,
    updateBarbero,
    deleteBarbero,
    getBarberAvailability,
} from "./handlers/date"

// Handlers de trabajos
import { getWorks, createWorks, deleteWorks } from "./handlers/works.Handlers"
import { uploadWork } from "./config/cloudinaryWorks"

const router = Router()

// ====================== RUTAS ESPECÍFICAS (ANTES DE :id) ======================

// Barberos
router.get("/barberos", getBarberos)

router.post("/barberos",
    body("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(),
    body("foto").optional().isString().trim(),
    handlerInputErrors,
    addBarbero
)

router.put("/barberos/:id",
    param("id").isInt().withMessage("ID no válido"),
    body("nombre").optional().isString().trim(),
    body("foto").optional().isString().trim(),
    handlerInputErrors,
    updateBarbero
)

router.delete("/barberos/:id",
    param("id").isInt().withMessage("ID no válido"),
    handlerInputErrors,
    deleteBarbero
)

// Availability
router.get("/availability/:barber",
    param("barber").notEmpty().withMessage("Barbero requerido").trim(),
    handlerInputErrors,
    getBarberAvailability
)

// Trabajos (Works)
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
router.get("/:id",    param("id").isInt().withMessage("ID no válido"), handlerInputErrors, getDateById)
router.put("/:id",    param("id").isInt().withMessage("ID no válido"), handlerInputErrors, UpdateDate)
router.patch("/:id",  param("id").isInt().withMessage("ID no válido"), handlerInputErrors, updateAppointmentStatus)
router.delete("/:id", param("id").isInt().withMessage("ID no válido"), handlerInputErrors, deleteDate)

export default router