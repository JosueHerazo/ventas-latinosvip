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
    saveBarberos,   
    updateBarberos,  
    deleteBarberos,      // ← Cambiado
    getBarberAvailability,
} from "./handlers/date";

import { getWorks, createWorks, deleteWorks } from "./handlers/works.Handlers";  // ← Importa desde date.ts
import { uploadWork } from "./config/cloudinaryWorks";

const router = Router();

// Barberos
router.get("/barberos", getBarberos);
router.post("/barberos", saveBarberos);   
router.put("/barberos/:id", updateBarberos);// ← Usa saveBarberos
router.delete("/barberos/:id", deleteBarberos); // ← Ruta corregida
// Availability
router.get("/availability/:barber", getBarberAvailability);

// Trabajos (IMPORTANTE)
router.get("/trabajos", getWorks);
router.post("/trabajos", uploadWork.single("archivo"), createWorks);   // ← Ruta correcta
router.delete("/trabajos/:id", deleteWorks);

// CRUD Citas
router.get("/", getDates);
router.post("/", createDate);

router.get("/:id", getDateById);
router.put("/:id", UpdateDate);
router.patch("/:id", updateAppointmentStatus);
router.delete("/:id", deleteDate);

export default router;