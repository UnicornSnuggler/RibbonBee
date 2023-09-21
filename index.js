require('dotenv').config();
const fs = require('fs');
const { Client, Collection, GatewayIntentBits, Partials, Events } = require('discord.js');
const { SendContentAsEmbed } = require('./utilities/messageHelper');
const { ReportError } = require('./utilities/errorHelper');

const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent], partials: [Partials.Channel] });

client.commands = new Collection();
const globalCommandFiles = fs.readdirSync('./global_commands').filter(file => file.endsWith('.js'));

for (const globalCommandFile of globalCommandFiles) {
    const globalCommand = require(`./global_commands/${globalCommandFile}`);
    client.commands.set(globalCommand.data.name, globalCommand);
}

client.on(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, context => {
    if (context.author.bot) return;

    if (context.mentions.users.find(x => x === client.user)) {
        context.react('💕');
    }
});

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        command.execute(interaction);
    }
    catch (error) {
        ReportError(interaction, error);
    }
});

client.login(process.env.discordToken);