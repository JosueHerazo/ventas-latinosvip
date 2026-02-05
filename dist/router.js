"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const service_1 = require("./handlers/service");
const middleware_1 = require("./middleware");
const router = (0, express_1.Router)();
//  Routing
router.get("/", service_1.getProducts);
router.post("/", 
//validacion
(0, express_validator_1.body)("service").notEmpty().withMessage("El nombre del servicio no puede ir vacio"), (0, express_validator_1.body)("price").isNumeric().withMessage("Valor no valido").notEmpty().withMessage("El valor del producto no ir vacio").custom(value => value > 0).withMessage("Precio no valido"), middleware_1.handlerInputErrors, (0, express_validator_1.body)("barber").notEmpty().withMessage("El nombre del barbero no puede ir vacio"), (0, express_validator_1.body)("client").notEmpty().withMessage("el nombre no puede ir vacio"), (0, express_validator_1.body)("phone").notEmpty().withMessage("El telefono no puede ir vacio"), service_1.createProduct);
router.post('/api/cierres', service_1.archivarSemana);
router.get("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no valido"), middleware_1.handlerInputErrors, service_1.getProductById);
// PUT SI ENVIAS UNA PARTE LAS DEMAS PARTES DEL OBJETO SE ENVIAN VACIAS 
router.put("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no valido"), middleware_1.handlerInputErrors, service_1.UpdateProduct);
// CON PATCH SE PUEDE MODIFICAR PARTES DEL OBJETO SIN QUE MODIFIQUE LAS DEMAS PARTES DEL OBJETO
// con patch se envie la disponibilidad del product solo se toma del dataValue pel producto para motificar el boolean de true a false
router.patch("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no valido"), middleware_1.handlerInputErrors, service_1.updateAvailability);
router.delete("/:id", (0, express_validator_1.param)("id").isInt().withMessage("ID no valido"), middleware_1.handlerInputErrors, service_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=router.js.map