"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routerDates.ts
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("./middleware");
const date_1 = require("./handlers/date");
const works_Handlers_1 = require("./handlers/works.Handlers");
// import { uploadWork } frñom "./config/cloudinaryWorks";
const router = (0, express_1.Router)();
// ── Barberos ──────────────────────────────────────────────────────────────────
router.get("/barberos", date_1.getBarberos);
// Ruta nueva: crea un barbero real en la tabla `barberos`
router.post("/barberos", (0, express_validator_1.body)("nombre").notEmpty().trim().withMessage("El nombre es obligatorio"), middleware_1.handlerInputErrors, date_1.addBarbero, date_1.saveBarberos);
// Ruta legado: guarda JSON en sentinel de la tabla `dates` (puede mantenerse o quitarse)
// router.post("/barberos", );
router.put("/barberos/:id", (0, express_validator_1.param)("id").notEmpty(), middleware_1.handlerInputErrors, date_1.updateBarberos);
router.delete("/barberos/:id", (0, express_validator_1.param)("id").notEmpty(), middleware_1.handlerInputErrors, date_1.deleteBarberos);
// ── Disponibilidad ────────────────────────────────────────────────────────────
router.get("/availability/:barber", (0, express_validator_1.param)("barber").notEmpty().trim(), middleware_1.handlerInputErrors, date_1.getBarberAvailability);
// ── Trabajos ──────────────────────────────────────────────────────────────────
// router.get("/trabajos", getWorks);
router.post("/trabajos", works_Handlers_1.createWorks);
router.delete("/trabajos/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no válido"), middleware_1.handlerInputErrors, works_Handlers_1.deleteWorks);
// ── CRUD Citas ────────────────────────────────────────────────────────────────
router.get("/", date_1.getDates);
router.post("/", (0, express_validator_1.body)("service").notEmpty(), (0, express_validator_1.body)("price").notEmpty().isNumeric(), (0, express_validator_1.body)("barber").isString().notEmpty().trim(), (0, express_validator_1.body)("dateList").notEmpty(), (0, express_validator_1.body)("client").notEmpty(), (0, express_validator_1.body)("phone").notEmpty(), (0, express_validator_1.body)("duration").isNumeric().notEmpty(), middleware_1.handlerInputErrors, date_1.createDate);
// Rutas con ID (siempre al final para no colisionar con /barberos, /trabajos)
router.get("/:id", (0, express_validator_1.param)("id").isInt(), middleware_1.handlerInputErrors, date_1.getDateById);
router.put("/:id", (0, express_validator_1.param)("id").isInt(), middleware_1.handlerInputErrors, date_1.UpdateDate);
router.patch("/:id", (0, express_validator_1.param)("id").isInt(), middleware_1.handlerInputErrors, date_1.updateAppointmentStatus);
router.delete("/:id", (0, express_validator_1.param)("id").isInt(), middleware_1.handlerInputErrors, date_1.deleteDate);
exports.default = router;
//# sourceMappingURL=routerDates.js.map