"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routerDates.ts
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const middleware_1 = require("./middleware");
const date_1 = require("./handlers/date");
const works_Handlers_1 = require("./handlers/works.Handlers");
const cloudinaryWorks_1 = require("./config/cloudinaryWorks");
const router = (0, express_1.Router)();
// Barberos
router.get("/barberos", date_1.getBarberos);
router.post("/barberos", (0, express_validator_1.body)("nombre").notEmpty().withMessage("El nombre es obligatorio").trim(), (0, express_validator_1.body)("foto").optional().isString().trim(), middleware_1.handlerInputErrors, date_1.addBarbero);
router.put("/barberos/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no válido"), (0, express_validator_1.body)("nombre").optional().isString().trim(), (0, express_validator_1.body)("foto").optional().isString().trim(), middleware_1.handlerInputErrors, date_1.updateBarbero);
router.delete("/barberos/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no válido"), middleware_1.handlerInputErrors, date_1.deleteBarbero);
// Availability
router.get("/availability/:barber", (0, express_validator_1.param)("barber").notEmpty().withMessage("Barbero requerido").trim(), middleware_1.handlerInputErrors, date_1.getBarberAvailability);
// Works
router.get("/works", works_Handlers_1.getWorks);
router.post("/works", cloudinaryWorks_1.uploadWork.single("archivo"), works_Handlers_1.createWorks);
router.delete("/works/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no válido"), middleware_1.handlerInputErrors, works_Handlers_1.deleteWorks);
// CRUD Citas
router.get("/", date_1.getDates);
router.post("/", (0, express_validator_1.body)("service").notEmpty().withMessage("El servicio es requerido"), (0, express_validator_1.body)("price").notEmpty().isNumeric().custom(v => parseFloat(v) >= 0), (0, express_validator_1.body)("barber").isString().notEmpty().trim(), (0, express_validator_1.body)("dateList").notEmpty(), (0, express_validator_1.body)("client").notEmpty(), (0, express_validator_1.body)("phone").notEmpty(), (0, express_validator_1.body)("duration").isNumeric().notEmpty(), middleware_1.handlerInputErrors, date_1.createDate);
// Rutas con :id → SIEMPRE AL FINAL
router.get("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no válido"), middleware_1.handlerInputErrors, date_1.getDateById);
router.put("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no válido"), middleware_1.handlerInputErrors, date_1.UpdateDate);
router.patch("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no válido"), middleware_1.handlerInputErrors, date_1.updateAppointmentStatus);
router.delete("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no válido"), middleware_1.handlerInputErrors, date_1.deleteDate);
exports.default = router;
//# sourceMappingURL=routerDates.js.map