const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: 'embed',
        description: 'Create a rich embed message with customization options',
        defaultMemberPermissions: '0'
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing guild (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Successfully reloaded guild (/) commands.');
        console.log('Commands will be available immediately in your guild!');
    } catch (error) {
        console.error(error);
    }
})(); 