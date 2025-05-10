"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const discord_js_1 = require("discord.js");
const discord_js_2 = require("discord.js");
const tracker_1 = require("./scheduler/tracker");
const dotenv = __importStar(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const wishlist_1 = __importDefault(require("./models/wishlist"));
dotenv.config();
// Cargar variables de entorno
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
// Crear cliente
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent
    ],
});
client.commands = new discord_js_1.Collection();
// Cargar comandos dinámicamente
const commands = [];
const commandsPath = path_1.default.join(__dirname, 'commands');
const commandFiles = fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
}
// Registrar comandos globales
const rest = new discord_js_1.REST({ version: '10' }).setToken(TOKEN);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('📡 Registrando comandos slash globales...');
        yield rest.put(discord_js_1.Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Comandos registrados');
    }
    catch (err) {
        console.error('❌ Error registrando comandos:', err);
    }
}))();
// Conexión a MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => console.error('❌ Error con MongoDB:', err));
// Evento ready
client.once('ready', () => {
    var _a;
    console.log(`🤖 Bot iniciado como ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
    setInterval(() => {
        const canalOfertas = process.env.DISCORD_CHANNEL_OFERTAS;
        (0, tracker_1.checkPriceDrops)(client, canalOfertas);
    }, 1000 * 60 * 30);
});
// Manejo de slash commands
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    // Slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command)
            return;
        try {
            yield command.execute(interaction);
        }
        catch (err) {
            console.error(err);
            if (interaction.replied || interaction.deferred) {
                yield interaction.followUp({ content: '❌ Error ejecutando el comando.', ephemeral: true });
            }
            else {
                yield interaction.reply({ content: '❌ Error ejecutando el comando.', ephemeral: true });
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
            const wishlist = yield wishlist_1.default.findOne({ userId });
            if (!wishlist) {
                return yield interaction.reply({ content: '❌ No se encontró tu lista.', ephemeral: true });
            }
            const product = wishlist.products.find(p => p.asin === asin);
            if (!product) {
                return yield interaction.reply({ content: '❌ Producto no encontrado en tu lista.', ephemeral: true });
            }
            product.notificado = false;
            product.notificacionesEnviadas = 0;
            yield wishlist.save();
            return yield interaction.reply({
                content: `🔁 Se ha reactivado la notificación para **${product.name}**.`,
                ephemeral: true
            });
        }
        // Activar alerta
        if (customId.startsWith('alert_')) {
            const asin = customId.replace('alert_', '');
            const modal = new discord_js_2.ModalBuilder()
                .setCustomId(`set_alert_${asin}`)
                .setTitle('Activar alerta de precio');
            const priceInput = new discord_js_2.TextInputBuilder()
                .setCustomId('alert_price')
                .setLabel('Precio objetivo (ej: 1500)')
                .setStyle(discord_js_2.TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Ingresa el precio deseado');
            const row = new discord_js_2.ActionRowBuilder().addComponents(priceInput);
            modal.addComponents(row);
            return yield interaction.showModal(modal);
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
                return yield interaction.reply({ content: '❌ El precio ingresado no es válido.', ephemeral: true });
            }
            const wishlist = yield wishlist_1.default.findOne({ userId });
            if (!wishlist) {
                return yield interaction.reply({ content: '❌ No se encontró tu lista.', ephemeral: true });
            }
            const product = wishlist.products.find(p => p.asin === asin);
            if (!product) {
                return yield interaction.reply({ content: '❌ Producto no encontrado en tu lista.', ephemeral: true });
            }
            product.alertPrice = alertPrice;
            product.notificado = false;
            product.notificacionesEnviadas = 0;
            yield wishlist.save();
            yield interaction.reply({
                content: `✅ Se activó una alerta para **${product.name}** cuando baje a **$${alertPrice.toFixed(2)}** o menos.`,
                ephemeral: true
            });
        }
    }
}));
client.login(TOKEN);
