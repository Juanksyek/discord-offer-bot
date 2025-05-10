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
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = interaction.options.getString('url', true);
        const userId = interaction.user.id;
        yield interaction.deferReply({ ephemeral: true });
        try {
            const product = yield (0, amazon_1.extractProductInfo)(url);
            yield (0, wishlist_1.addProductToWishList)(userId, product);
            yield interaction.editReply(`✅ Producto agregado: **${product.name}**`);
        }
        catch (err) {
            console.error(err);
            yield interaction.editReply('❌ Hubo un error al procesar la URL.');
        }
    });
}
