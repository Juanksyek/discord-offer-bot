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
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarSpamNotificacion = iniciarSpamNotificacion;
const timers_1 = require("timers");
function iniciarSpamNotificacion(Client, userId, product, updated) {
    let count = 0;
    const interval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (count >= 5) {
            (0, timers_1.clearInterval)(interval);
            return;
        }
        try {
            const user = yield Client.users.fetch(userId);
            yield user.send({
                content: `📣 ¡Tu producto ha bajado de precio!`,
                embeds: [{
                        title: `🔥 ${updated.name}`,
                        description: `💸 **Antes:** $${product.price}\n💥 **Ahora:** $${updated.price}`,
                        url: (_a = product.url) !== null && _a !== void 0 ? _a : '',
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
    }), 1000);
}
