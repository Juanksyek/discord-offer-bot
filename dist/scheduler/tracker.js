"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPriceDrops = checkPriceDrops;
const wishlist_1 = __importDefault(require("../models/wishlist"));
const amazon_1 = require("../services/amazon");
const iniciarSpamNotificacion_1 = require("../utils/iniciarSpamNotificacion");
async function checkPriceDrops(client, channelId) {
    const wishlists = await wishlist_1.default.find();
    for (const list of wishlists) {
        for (const product of list.products) {
            try {
                if (!product.url) {
                    console.warn(`Product URL is invalid for ${product.name}`);
                    continue;
                }
                const updated = await (0, amazon_1.extractProductInfo)(product.url);
                const shouldNotify = (product.alertPrice && updated.price <= product.alertPrice) ||
                    (!product.alertPrice && updated.price < (product.price ?? Infinity));
                if (shouldNotify && !product.notificado) {
                    const channel = client.channels.cache.get(channelId);
                    if (!channel || !channel.isTextBased()) {
                        console.warn(`❌ Canal no encontrado o no es de texto: ${channelId}`);
                        continue;
                    }
                    // Notificación por canal
                    await channel.send({
                        content: `📣 ¡<@${list.userId}> tu producto ha bajado de precio!`,
                        embeds: [{
                                title: `🔥 ${updated.name}`,
                                description: `💸 **Antes:** $${product.price}\n💥 **Ahora:** $${updated.price}`,
                                url: product.url ?? '',
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
        await list.save();
    }
}
