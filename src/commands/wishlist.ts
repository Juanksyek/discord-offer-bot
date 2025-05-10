import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
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

    const embeds = wishlist.products.map(product => {
      const name = product.name || 'Producto sin nombre';
      const url = product.url || 'https://www.amazon.com.mx/';
      const image = product.image || 'https://via.placeholder.com/400x200.png?text=Sin+imagen';
      const asin = product.asin || 'N/A';
      const price = typeof product.price === 'number' ? product.price : 0;

      return new EmbedBuilder()
        .setTitle(name)
        .setURL(url)
        .setImage(image)
        .addFields(
          { name: 'Precio actual', value: `$${price.toFixed(2)}`, inline: true },
          { name: 'ASIN', value: asin, inline: true }
        )
        .setColor(0x00AE86);
    });

    await interaction.editReply({
      content: `🛒 Productos en tu lista de deseos (${wishlist.products.length}):`,
      embeds
    });
  } catch (err) {
    console.error(err);
    await interaction.editReply('❌ Hubo un error al obtener tu lista de deseos.');
  }
}
