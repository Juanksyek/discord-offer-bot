import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { checkPriceDrops } from './scheduler/tracker';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import WishListModel from './models/wishlist';

dotenv.config();

// Cargar variables de entorno
const TOKEN = process.env.DISCORD_BOT_TOKEN!;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID!;

// Extender la clase Client para incluir comandos
interface ExtendedClient extends Client {
    commands: Collection<string, any>;
}

// Crear cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
}) as ExtendedClient;

client.commands = new Collection();

// Cargar comandos dinámicamente
const commands: any[] = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
}

// Registrar comandos globales
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('📡 Registrando comandos slash globales...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Comandos registrados');
    } catch (err) {
        console.error('❌ Error registrando comandos:', err);
    }
})();

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI!)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error con MongoDB:', err));

// Evento ready
client.once('ready', () => {
    console.log(`🤖 Bot iniciado como ${client.user?.tag}`);

    setInterval(() => {
        const canalOfertas = process.env.DISCORD_CHANNEL_OFERTAS!;
        checkPriceDrops(client, canalOfertas);
    }, 1000 * 60 * 30);
});

// Manejo de slash commands
client.on('interactionCreate', async interaction => {
    // Slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Error ejecutando el comando.', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Error ejecutando el comando.', ephemeral: true });
            }
        }
    }

    // Botones
    if (interaction.isButton()) {
        const userId = interaction.user.id;
        const customId = interaction.customId;

        // Eliminar notificación bloqueada
        if (customId.startsWith('resetnotify_')) {
            const asin = customId.replace('resetnotify_', '');
            const wishlist = await WishListModel.findOne({ userId });
            if (!wishlist) {
                return await interaction.reply({ content: '❌ No se encontró tu lista.', ephemeral: true });
            }

            const product = wishlist.products.find(p => p.asin === asin);
            if (!product) {
                return await interaction.reply({ content: '❌ Producto no encontrado en tu lista.', ephemeral: true });
            }

            product.notificado = false;
            product.notificacionesEnviadas = 0;
            await wishlist.save();

            return await interaction.reply({
                content: `🔁 Se ha reactivado la notificación para **${product.name}**.`,
                ephemeral: true
            });
        }

        // Activar alerta
        if (customId.startsWith('alert_')) {
            const asin = customId.replace('alert_', '');

            const modal = new ModalBuilder()
                .setCustomId(`set_alert_${asin}`)
                .setTitle('Activar alerta de precio');

            const priceInput = new TextInputBuilder()
                .setCustomId('alert_price')
                .setLabel('Precio objetivo (ej: 1500)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Ingresa el precio deseado');

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(priceInput);
            modal.addComponents(row);

            return await interaction.showModal(modal);
        }
    }

    // Modal de alerta
    if (interaction.isModalSubmit()) {
        const customId = interaction.customId;

        if (customId.startsWith('set_alert_')) {
            const asin = customId.replace('set_alert_', '');
            const userId = interaction.user.id;

            const priceInput = interaction.fields.getTextInputValue('alert_price');
            const alertPrice = parseFloat(priceInput);

            if (isNaN(alertPrice) || alertPrice <= 0) {
                return await interaction.reply({ content: '❌ El precio ingresado no es válido.', ephemeral: true });
            }

            const wishlist = await WishListModel.findOne({ userId });
            if (!wishlist) {
                return await interaction.reply({ content: '❌ No se encontró tu lista.', ephemeral: true });
            }

            const product = wishlist.products.find(p => p.asin === asin);
            if (!product) {
                return await interaction.reply({ content: '❌ Producto no encontrado en tu lista.', ephemeral: true });
            }

            product.alertPrice = alertPrice;
            product.notificado = false;
            product.notificacionesEnviadas = 0;
            await wishlist.save();

            await interaction.reply({
                content: `✅ Se activó una alerta para **${product.name}** cuando baje a **$${alertPrice.toFixed(2)}** o menos.`,
                ephemeral: true
            });
        }
    }
});

client.login(TOKEN);