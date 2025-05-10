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
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const wishlist_1 = __importDefault(require("../models/wishlist"));
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('wishlist')
    .setDescription('Muestra los productos que has guardado en tu lista de deseos');
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        yield interaction.deferReply({ ephemeral: true });
        try {
            const userId = interaction.user.id;
            const wishlist = yield wishlist_1.default.findOne({ userId });
            if (!wishlist || wishlist.products.length === 0) {
                yield interaction.editReply('❌ No tienes productos guardados en tu lista de deseos.');
                return;
            }
            const messages = [];
            for (const product of wishlist.products) {
                const name = product.name || 'Producto sin nombre';
                const url = product.url || 'https://www.amazon.com.mx/';
                const image = product.image || 'https://via.placeholder.com/400x200.png?text=Sin+imagen';
                const asin = product.asin || 'N/A';
                const price = typeof product.price === 'number' ? product.price : 0;
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle(name)
                    .setURL(url)
                    .setImage(image)
                    .addFields({ name: 'Precio actual', value: `$${price.toFixed(2)}`, inline: true }, { name: 'ASIN', value: asin, inline: true })
                    .setColor(0x00AE86);
                const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`delete_${asin}`)
                    .setLabel('Eliminar ❌')
                    .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
                    .setCustomId(`alert_${asin}`)
                    .setLabel('🔔 Activar alerta')
                    .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                    .setCustomId(`resetnotify_${asin}`)
                    .setLabel(`🔁 Volver a notificar`)
                    .setStyle(discord_js_1.ButtonStyle.Secondary));
                const msg = yield interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
                messages.push(msg);
            }
        }
        catch (err) {
            console.error(err);
            yield interaction.editReply('❌ Hubo un error al obtener tu lista de deseos.');
        }
    });
}
