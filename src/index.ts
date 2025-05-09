import { Client, GatewayIntentBits, Collection, REST, Routes, Interaction } from 'discord.js';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

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
});

// Manejo de slash commands
client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

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
});

client.login(TOKEN);