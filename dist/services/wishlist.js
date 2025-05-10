"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProductToWishList = addProductToWishList;
const wishlist_1 = __importDefault(require("../models/wishlist"));
async function addProductToWishList(userId, product) {
    const user = await wishlist_1.default.findOne({ userId });
    if (user) {
        user.products.push({ ...product, lastChecked: new Date() });
        return await user.save();
    }
    return await wishlist_1.default.create({
        userId,
        products: [{ ...product, lastChecked: new Date() }]
    });
}
