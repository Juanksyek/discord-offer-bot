import { Client } from "discord.js";
import { clearInterval } from "timers";

export function iniciarSpamNotificacion(
    Client: Client,
    userId: string,
    product: any,
    updated: any
) { 
    let count = 0;
    const interval = setInterval(async () => {
        if (count >= 5) {
            clearInterval(interval);
            return;
        }

        try {
            const user = await Client.users.fetch(userId);
            
            await user.send({
                content: `📣 ¡Tu producto ha bajado de precio!`,
                embeds: [{
                    title: `🔥 ${updated.name}`,
                    description: `💸 **Antes:** $${product.price}\n💥 **Ahora:** $${updated.price}`,
                    url: product.url ?? '',
                    image: { url: updated.image },
                    color: 0xff0000
                }]
            });
            count++;
        } catch (err) {
            console.error(`Error enviando DM a ${userId}`, err);
            clearInterval(interval);
        }
    }, 1000);
}