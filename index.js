const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Store embed data temporarily (in production, use a database)
const embedData = new Map();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bot is ready! Use /embed to create rich embeds.');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'embed') {
            await handleEmbedCommand(interaction);
        }
    } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
    } else if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
    }
});

async function handleEmbedCommand(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🎯 **Embed Creator**')
        .setDescription('Create beautiful, rich embeds with this powerful tool!\n\n**Features:**\n• ✏️ Customize title and description\n• 🎨 Change colors with hex codes\n• 📤 Send professional embeds\n• 🎯 Rich formatting support')
        .setColor('#5865F2')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: '📋 **Current Settings**', value: 'Title: `Embed Preview`\nDescription: `This is a test`\nColor: `#5865F2`', inline: true },
            { name: '⚙️ **Quick Actions**', value: 'Click the buttons below to customize your embed and make it look professional!', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Powered by Zentro • Rich Embed Creator', iconURL: client.user.displayAvatarURL() });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('edit_text')
                .setLabel('Edit Text')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('✏️'),
            new ButtonBuilder()
                .setCustomId('edit_style')
                .setLabel('Customize Style')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🎨'),
            new ButtonBuilder()
                .setCustomId('send_embed')
                .setLabel('Send Embed')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📤')
        );

    // Store initial embed data
    embedData.set(interaction.user.id, {
        title: '🎯 **Embed Creator**',
        description: 'Create beautiful, rich embeds with this powerful tool!\n\n**Features:**\n• ✏️ Customize title and description\n• 🎨 Change colors with hex codes\n• 📤 Send professional embeds\n• 🎯 Rich formatting support',
        color: '#5865F2',
        timestamp: true,
        thumbnail: true
    });

    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    });
}

async function handleButtonInteraction(interaction) {
    const userId = interaction.user.id;
    const data = embedData.get(userId) || {
        title: '🎯 **Embed Creator**',
        description: 'Create beautiful, rich embeds with this powerful tool!\n\n**Features:**\n• ✏️ Customize title and description\n• 🎨 Change colors with hex codes\n• 📤 Send professional embeds\n• 🎯 Rich formatting support',
        color: '#5865F2',
        timestamp: true,
        thumbnail: true
    };

    if (interaction.customId === 'edit_text') {
        const modal = new ModalBuilder()
            .setCustomId('embed_text_modal')
            .setTitle('Edit Embed Text');

        const titleInput = new TextInputBuilder()
            .setCustomId('embed_title')
            .setLabel('Title')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('🎯 **Your Title Here** (supports **bold**, *italic*, etc.)')
            .setValue(data.title)
            .setRequired(false)
            .setMaxLength(256);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('embed_description')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Create beautiful, rich embeds with this powerful tool!\n\n**Features:**\n• ✏️ Customize title and description\n• 🎨 Change colors with hex codes\n• 📤 Send professional embeds\n• 🎯 Rich formatting support\n\nSupports **bold**, *italic*, `code`, and more!')
            .setValue(data.description)
            .setRequired(false)
            .setMaxLength(4000);

        const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(descriptionInput);

        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);

    } else if (interaction.customId === 'edit_style') {
        const modal = new ModalBuilder()
            .setCustomId('embed_style_modal')
            .setTitle('Edit Embed Style');

        const colorInput = new TextInputBuilder()
            .setCustomId('embed_color')
            .setLabel('Color (Hex Code)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter hex color code (e.g., #0099ff)')
            .setValue(data.color)
            .setRequired(false)
            .setMaxLength(7);

        const actionRow = new ActionRowBuilder().addComponents(colorInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);

    } else if (interaction.customId === 'send_embed') {
        const embed = new EmbedBuilder()
            .setTitle(data.title)
            .setDescription(data.description)
            .setColor(data.color)
            .setThumbnail(data.thumbnail ? client.user.displayAvatarURL() : null)
            .setFooter({ text: 'Powered by Zentro • Rich Embed Creator', iconURL: client.user.displayAvatarURL() });

        if (data.timestamp) {
            embed.setTimestamp();
        }

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ 
            content: '✅ **Embed sent successfully!** Your beautiful embed has been published to the channel.', 
            ephemeral: true 
        });
        
        // Clear stored data
        embedData.delete(userId);
    }
}

async function handleModalSubmit(interaction) {
    const userId = interaction.user.id;
    const data = embedData.get(userId) || {
        title: '🎯 **Embed Creator**',
        description: 'Create beautiful, rich embeds with this powerful tool!\n\n**Features:**\n• ✏️ Customize title and description\n• 🎨 Change colors with hex codes\n• 📤 Send professional embeds\n• 🎯 Rich formatting support',
        color: '#5865F2',
        timestamp: true,
        thumbnail: true
    };

    if (interaction.customId === 'embed_text_modal') {
        const title = interaction.fields.getTextInputValue('embed_title');
        const description = interaction.fields.getTextInputValue('embed_description');

        data.title = title || '🎯 **Embed Creator**';
        data.description = description || 'Create beautiful, rich embeds with this powerful tool!\n\n**Features:**\n• ✏️ Customize title and description\n• 🎨 Change colors with hex codes\n• 📤 Send professional embeds\n• 🎯 Rich formatting support';
        embedData.set(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(data.title)
            .setDescription(data.description)
            .setColor(data.color)
            .setThumbnail(data.thumbnail ? client.user.displayAvatarURL() : null)
            .setTimestamp()
            .setFooter({ text: 'Powered by Zentro • Rich Embed Creator', iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('edit_text')
                    .setLabel('Edit Text')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✏️'),
                new ButtonBuilder()
                    .setCustomId('edit_style')
                    .setLabel('Customize Style')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎨'),
                new ButtonBuilder()
                    .setCustomId('send_embed')
                    .setLabel('Send Embed')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📤')
            );

        await interaction.update({
            embeds: [embed],
            components: [row]
        });

    } else if (interaction.customId === 'embed_style_modal') {
        const color = interaction.fields.getTextInputValue('embed_color');
        
        // Validate hex color
        const hexColorRegex = /^#[0-9A-F]{6}$/i;
        if (color && !hexColorRegex.test(color)) {
            await interaction.reply({
                content: '❌ Invalid hex color code! Please use format like #0099ff',
                ephemeral: true
            });
            return;
        }

        data.color = color || '#5865F2';
        embedData.set(userId, data);

        const embed = new EmbedBuilder()
            .setTitle(data.title)
            .setDescription(data.description)
            .setColor(data.color)
            .setThumbnail(data.thumbnail ? client.user.displayAvatarURL() : null)
            .setTimestamp()
            .setFooter({ text: 'Powered by Zentro • Rich Embed Creator', iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('edit_text')
                    .setLabel('Edit Text')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✏️'),
                new ButtonBuilder()
                    .setCustomId('edit_style')
                    .setLabel('Customize Style')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎨'),
                new ButtonBuilder()
                    .setCustomId('send_embed')
                    .setLabel('Send Embed')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📤')
            );

        await interaction.update({
            embeds: [embed],
            components: [row]
        });
    }
}


client.login(process.env.TOKEN); 

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Web server active to keep Railway container alive');
});
