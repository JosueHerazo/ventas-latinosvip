// routerDates.ts
import { Router } from "express";
import { body, param } from "express-validator";
import { handlerInputErrors } from "./middleware";

import {
    getDates,
    createDate,
    getDateById,
    UpdateDate,
    updateAppointmentStatus,
    deleteDate,
    getBarberos,
    addBarbero,      // ← POST /barberos/add  (crea en tabla barberos)
    saveBarberos,    // ← POST /barberos      (legado JSON sentinel — mantener por compatibilidad)
    updateBarberos,
    deleteBarberos,
    getBarberAvailability,
    createWorks,
    deleteWorks,
    getWorks,
} from "./handlers/date";


const router = Router();

// ── Barberos ──────────────────────────────────────────────────────────────────
router.get("/barberos", getBarberos);

// Ruta nueva: crea un barbero real en la tabla `barberos`
router.post(
    "/barberos",
    body("nombre").notEmpty().trim().withMessage("El nombre es obligatorio"),
    handlerInputErrors,
    addBarbero,
    saveBarberos
);

// Ruta legado: guarda JSON en sentinel de la tabla `dates` (puede mantenerse o quitarse)
// router.post("/barberos", );

router.put(
    "/barberos/:id",
    param("id").notEmpty(),
    handlerInputErrors,
    updateBarberos
);

router.delete(
    "/barberos/:id",
    param("id").notEmpty(),
    handlerInputErrors,
    deleteBarberos
);

// ── Disponibilidad ────────────────────────────────────────────────────────────
router.get(
    "/availability/:barber",
    param("barber").notEmpty().trim(),
    handlerInputErrors,
    getBarberAvailability
);

// ── Trabajos 
// router.get("/trabajos", getWorks);
router.post("/trabajos", createWorks); // ✅ BIEN
router.get("/trabajos", getWorks);

router.delete("/trabajos/:id", 
    param("id").isInt().withMessage("ID no válido"),
    handlerInputErrors,
    deleteWorks
)
// ── CRUD Citas ────────────────────────────────────────────────────────────────
router.get("/", getDates);
router.post(
    "/",
    body("service").notEmpty(),
    body("price").notEmpty().isNumeric(),
    body("barber").isString().notEmpty().trim(),
    body("dateList").notEmpty(),
    body("client").notEmpty(),
    body("phone").notEmpty(),
    body("duration").isNumeric().notEmpty(),
    handlerInputErrors,
    createDate
);

// Rutas con ID (siempre al final para no colisionar con /barberos, /trabajos)
router.get("/:id",    param("id").isInt(), handlerInputErrors, getDateById);
router.put("/:id",    param("id").isInt(), handlerInputErrors, UpdateDate);
router.patch("/:id",  param("id").isInt(), handlerInputErrors, updateAppointmentStatus);
router.delete("/:id", param("id").isInt(), handlerInputErrors, deleteDate);

export default router;