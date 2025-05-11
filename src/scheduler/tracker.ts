import WishListModel from '../models/wishlist';
import { extractProductInfo } from '../services/amazon';
import { Client, TextChannel } from 'discord.js';
import { iniciarSpamNotificacion } from '../utils/iniciarSpamNotificacion';

export async function checkPriceDrops(client: Client, channelId: string) {
    const wishlists = await WishListModel.find();

    for (const list of wishlists) {
        for (const product of list.products) {
            try {
                if (!product.url) {
                    console.warn(`Product URL is invalid for ${product.name}`);
                    continue;
                }

                const updated = await extractProductInfo(product.url);

                if (updated.price > (product.price ?? 0) && !product.notificadoSubida) {
                    const channel = client.channels.cache.get(channelId);
                    if (channel && channel.isTextBased()) {
                        await (channel as TextChannel).send({
                            content: `📈 <@${list.userId}> tu producto ha subido de precio.`,
                            embeds: [{
                                title: `🔼 ${updated.name}`,
                                description: `💸 Antes: $${product.price}\n🔺 Ahora: $${updated.price}`,
                                url: product.url ?? '',
                                image: { url: updated.image },
                                color: 0xffa500
                            }]
                        });
                    }

                    product.notificadoSubida = true;
                    product.price = updated.price;
                    product.lastChecked = new Date();
                }

                const shouldNotify =
                    (product.alertPrice && updated.price <= product.alertPrice) ||
                    (!product.alertPrice && updated.price < (product.price ?? Infinity));

                if (shouldNotify && !product.notificado) {
                    const channel = client.channels.cache.get(channelId);

                    if (!channel || !channel.isTextBased()) {
                        console.warn(`❌ Canal no encontrado o no es de texto: ${channelId}`);
                        continue;
                    }

                    // Notificación por canal
                    await (channel as TextChannel).send({
                        content: `📣 ¡<@${list.userId}> tu producto ha bajado de precio!`,
                        embeds: [{
                            title: `🔥 ${updated.name}`,
                            description: `💸 **Antes:** $${product.price}\n💥 **Ahora:** $${updated.price}`,
                            url: product.url ?? '',
                            image: { url: updated.image },
                            color: 0x00ff00 
                        }]
                    });

                    // Lanzar spam por DM hasta 5 veces
                    if (list.userId) {
                        iniciarSpamNotificacion(client, list.userId, product, updated);
                    } else {
                        console.warn(`❌ User ID is invalid for product: ${product.name}`);
                    }

                    // Marcar como notificado y guardar
                    product.notificado = true;
                    product.price = updated.price;
                    product.lastChecked = new Date();
                }
            } catch (err) {
                console.error(`Error actualizando ${product.name}`, err);
            }
        }

        await list.save();
    }
}
