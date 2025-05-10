"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarSpamNotificacion = iniciarSpamNotificacion;
const timers_1 = require("timers");
function iniciarSpamNotificacion(Client, userId, product, updated) {
    let count = 0;
    const interval = setInterval(async () => {
        if (count >= 5) {
            (0, timers_1.clearInterval)(interval);
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
        }
        catch (err) {
            console.error(`Error enviando DM a ${userId}`, err);
            (0, timers_1.clearInterval)(interval);
        }
    }, 1000);
}
