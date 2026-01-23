"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Date_models_1 = __importDefault(require("./Date.models"));
let Client = class Client extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false
    }),
    __metadata("design:type", String)
], Client.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER(), // Guardamos como string para evitar problemas de ceros iniciales
        allowNull: false,
        unique: true
    }),
    __metadata("design:type", Number)
], Client.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(), // Guardamos como string para evitar problemas de ceros iniciales
        allowNull: false,
        unique: true
    }),
    __metadata("design:type", String)
], Client.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER(), // Guardamos como string para evitar problemas de ceros iniciales
        allowNull: false,
        unique: true
    }),
    __metadata("design:type", Number)
], Client.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN(), // Guardamos como string para evitar problemas de ceros iniciales
        allowNull: false,
        unique: true
    }),
    __metadata("design:type", Boolean)
], Client.prototype, "terms", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Date_models_1.default),
    __metadata("design:type", Array)
], Client.prototype, "services", void 0);
Client = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'clients'
    })
], Client);
exports.default = Client;
//# sourceMappingURL=Clients.models.js.map