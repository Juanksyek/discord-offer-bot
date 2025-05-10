"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPriceDrops = checkPriceDrops;
const wishlist_1 = __importDefault(require("../models/wishlist"));
const amazon_1 = require("../services/amazon");
const iniciarSpamNotificacion_1 = require("../utils/iniciarSpamNotificacion");
function checkPriceDrops(client, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const wishlists = yield wishlist_1.default.find();
        for (const list of wishlists) {
            for (const product of list.products) {
                try {
                    if (!product.url) {
                        console.warn(`Product URL is invalid for ${product.name}`);
                        continue;
                    }
                    const updated = yield (0, amazon_1.extractProductInfo)(product.url);
                    const shouldNotify = (product.alertPrice && updated.price <= product.alertPrice) ||
                        (!product.alertPrice && updated.price < ((_a = product.price) !== null && _a !== void 0 ? _a : Infinity));
                    if (shouldNotify && !product.notificado) {
                        const channel = client.channels.cache.get(channelId);
                        if (!channel || !channel.isTextBased()) {
                            console.warn(`❌ Canal no encontrado o no es de texto: ${channelId}`);
                            continue;
                        }
                        // Notificación por canal
                        yield channel.send({
                            content: `📣 ¡<@${list.userId}> tu producto ha bajado de precio!`,
                            embeds: [{
                                    title: `🔥 ${updated.name}`,
                                    description: `💸 **Antes:** $${product.price}\n💥 **Ahora:** $${updated.price}`,
                                    url: (_b = product.url) !== null && _b !== void 0 ? _b : '',
                                    image: { url: updated.image },
                                    color: 0xff0000
                                }]
                        });
                        // Lanzar spam por DM hasta 5 veces
                        if (list.userId) {
                            (0, iniciarSpamNotificacion_1.iniciarSpamNotificacion)(client, list.userId, product, updated);
                        }
                        else {
                            console.warn(`❌ User ID is invalid for product: ${product.name}`);
                        }
                        // Marcar como notificado y guardar
                        product.notificado = true;
                        product.price = updated.price;
                        product.lastChecked = new Date();
                    }
                }
                catch (err) {
                    console.error(`Error actualizando ${product.name}`, err);
                }
            }
            yield list.save();
        }
    });
}
