"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const date_1 = require("./handlers/date");
const middleware_1 = require("./middleware");
const router = (0, express_1.Router)();
//  Routing
router.get("/", date_1.getProducts);
router.post("/", 
//validacion
(0, express_validator_1.body)("service").notEmpty().withMessage("El nombre del servicio no puede ir vacio"), (0, express_validator_1.body)("price").isNumeric().withMessage("Valor no valido").notEmpty().withMessage("El valor del producto no ir vacio").custom(value => value > 0).withMessage("Precio no valido"), middleware_1.handlerInputErrors, (0, express_validator_1.body)("barber").notEmpty().withMessage("El nombre del barbero no puede ir vacio"), (0, express_validator_1.body)("date").notEmpty().withMessage("La fecha no puede ir vacio"), date_1.createProduct);
router.get("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no valido"), middleware_1.handlerInputErrors, date_1.getProductById);
// PUT SI ENVIAS UNA PARTE LAS DEMAS PARTES DEL OBJETO SE ENVIAN VACIAS 
router.put("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no valido"), middleware_1.handlerInputErrors, date_1.UpdateProduct);
// CON PATCH SE PUEDE MODIFICAR PARTES DEL OBJETO SIN QUE MODIFIQUE LAS DEMAS PARTES DEL OBJETO
// con patch se envie la disponibilidad del product solo se toma del dataValue pel producto para motificar el boolean de true a false
router.patch("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no valido"), middleware_1.handlerInputErrors, date_1.updateAvailability);
router.delete("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no valido"), middleware_1.handlerInputErrors, date_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=router.js.map