import { Router } from "express"
import { body, param } from "express-validator"
import {
    createDate, deleteDate, getDates, getDateById,
    updateAppointmentStatus, UpdateDate,
    getBarberAvailability,
    getBarberos, saveBarberos
} from "./handlers/date"
import { handlerInputErrors } from "./middleware"

const router = Router()

router.get("/", getDates)

// ── Barberos (SIN validadores, ANTES de /:id) ─────────────────
router.get("/barberos", getBarberos)
router.post("/barberos", saveBarberos)

// ── Availability (ANTES de /:id) ──────────────────────────────
router.get(
    "/availability/:barber",
    param("barber").notEmpty().withMessage("Barbero requerido").trim(),
    handlerInputErrors,
    getBarberAvailability
)

// ── Crear cita ────────────────────────────────────────────────
router.post("/",
    body("service").notEmpty().withMessage("El nombre del servicio no puede ir vacio"),
    body("price")
        .notEmpty().withMessage("El valor del producto no puede ir vacio")
        .isNumeric().withMessage("El precio debe ser un número")
        .custom(value => parseFloat(value) >= 0).withMessage("Precio no valido"),
    body("barber").isString().notEmpty().withMessage("El nombre del barbero no puede ir vacio").trim(),
    body("dateList").notEmpty().withMessage("La fecha no puede ir vacio"),
    body("client").notEmpty().withMessage("el nombre no puede ir vacio"),
    body("phone").notEmpty().withMessage("El telefono no puede ir vacio"),
    body("duration").isNumeric().notEmpty().withMessage("tiempo de service"),
    handlerInputErrors,
    createDate
)

// ── CRUD por ID (SIEMPRE al final) ────────────────────────────
router.get("/:id",
    param("id").isInt().withMessage("ID no valido"),
    handlerInputErrors,
    getDateById
)

router.put("/:id",
    param("id").isInt().withMessage("ID no valido"),
    handlerInputErrors,
    UpdateDate
)

router.patch("/:id",
    param("id").isInt().withMessage("ID no valido"),
    handlerInputErrors,
    updateAppointmentStatus
)

router.delete("/:id",
    param("id").isInt().withMessage("ID no valido"),
    handlerInputErrors,
    deleteDate
)

export default router