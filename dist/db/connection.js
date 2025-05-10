"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongo = connectToMongo;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectToMongo() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri)
            throw new Error('❌ URI de MongoDB no definida en .env');
        await mongoose_1.default.connect(uri);
        console.log('✅ Conectado a MongoDB');
    }
    catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
}
