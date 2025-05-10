import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { extractProductInfo } from '../services/amazon';
import { addProductToWishList } from '../services/wishlist';

export const data = new SlashCommandBuilder()
    .setName('wishlistadd')
    .setDescription('Agrega un producto a tu lista de deseos')
    .addStringOption(option =>
        option.setName('url')
            .setDescription('URL del producto en Amazon')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString('url', true);
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    try {
        const product = await extractProductInfo(url);
        await addProductToWishList(userId, product);

        await interaction.editReply(`✅ Producto agregado: **${product.name}**`);
    } catch (err) {
        console.error(err);
        await interaction.editReply('❌ Hubo un error al procesar la URL.');
    }
}
