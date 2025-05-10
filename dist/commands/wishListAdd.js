"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const amazon_1 = require("../services/amazon");
const wishlist_1 = require("../services/wishlist");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('wishlistadd')
    .setDescription('Agrega un producto a tu lista de deseos')
    .addStringOption(option => option.setName('url')
    .setDescription('URL del producto en Amazon')
    .setRequired(true));
async function execute(interaction) {
    const url = interaction.options.getString('url', true);
    const userId = interaction.user.id;
    await interaction.deferReply({ ephemeral: true });
    try {
        const product = await (0, amazon_1.extractProductInfo)(url);
        await (0, wishlist_1.addProductToWishList)(userId, product);
        await interaction.editReply(`✅ Producto agregado: **${product.name}**`);
    }
    catch (err) {
        console.error(err);
        await interaction.editReply('❌ Hubo un error al procesar la URL.');
    }
}
