"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    asin: String,
    name: String,
    price: Number,
    image: String,
    url: String,
    lastChecked: Date,
    alertPrice: Number,
    notificacionesEnviadas: {
        type: Number,
        default: 0
    },
    notificado: {
        type: Boolean,
        default: false
    },
    notificadoSubida: {
        type: Boolean,
        default: false
    }
});
const wishlistSchema = new mongoose_1.default.Schema({
    userId: String,
    products: [productSchema]
});
exports.default = mongoose_1.default.model('WishList', wishlistSchema);
