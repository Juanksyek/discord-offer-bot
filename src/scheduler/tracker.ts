import WishListModel from '../models/wishlist';
import { extractProductInfo } from '../services/amazon';
import { TextChannel, Client } from 'discord.js';

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

                if (updated.price < (product.price ?? Infinity)) {
                    const channel = client.channels.cache.get(channelId) as TextChannel;

                    await channel.send({
                        embeds: [{
                            title: `${updated.name}`,
                            description: `🔻 ¡Bajó de precio!\nAntes: $${product.price}\nAhora: $${updated.price}`,
                            url: product.url ?? '',
                            image: { url: updated.image },
                            color: 0x00ff00
                        }]
                    });

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
