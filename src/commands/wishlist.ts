import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import WishListModel from '../models/wishlist';

export const data = new SlashCommandBuilder()
    .setName('wishlist')
    .setDescription('Muestra los productos que has guardado en tu lista de deseos');

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;
        const wishlist = await WishListModel.findOne({ userId });

        if (!wishlist || wishlist.products.length === 0) {
            await interaction.editReply('❌ No tienes productos guardados en tu lista de deseos.');
            return;
        }

        const messages = [];

        for (const product of wishlist.products) {
            const name = product.name || 'Producto sin nombre';
            const url = product.url || 'https://www.amazon.com.mx/';
            const image = product.image || 'https://via.placeholder.com/400x200.png?text=Sin+imagen';
            const asin = product.asin || 'N/A';
            const price = typeof product.price === 'number' ? product.price : 0;

            const embed = new EmbedBuilder()
                .setTitle(name)
                .setURL(url)
                .setImage(image)
                .addFields(
                    { name: 'Precio actual', value: `$${price.toFixed(2)}`, inline: true },
                    { name: 'ASIN', value: asin, inline: true }
                )
                .setColor(0x00AE86);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`delete_${asin}`)
                    .setLabel('Eliminar ❌')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`alert_${asin}`)
                    .setLabel('🔔 Activar alerta')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`resetnotify_${asin}`)
                    .setLabel(`🔁 Volver a notificar`)
                    .setStyle(ButtonStyle.Secondary)
            );

            const msg = await interaction.followUp({ embeds: [embed], components: [row], ephemeral: true });
            messages.push(msg);
        }
    } catch (err) {
        console.error(err);
        await interaction.editReply('❌ Hubo un error al obtener tu lista de deseos.');
    }
}
