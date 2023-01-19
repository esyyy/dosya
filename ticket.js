const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
//Murat Eren
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Setup the ticket system')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option.setName('channel').setDescription('The channel where the tickets will be created').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('The staff role').setRequired(true))
        .addChannelOption(option => option.setName('open').setDescription('The category where the open tickets will be created').setRequired(true))
        .addChannelOption(option => option.setName('close').setDescription('The category where the closed tickets will be created').setRequired(true)),

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const open = interaction.options.getChannel('open');
        const close = interaction.options.getChannel('close');

        if (channel.type !== ChannelType.GuildText) {
            return await interaction.reply({ content: `⚠️ The \`channel\` option must be a text channel!`, ephemeral: true });
        }

        if (open.type !== ChannelType.GuildCategory) {
            return await interaction.reply({ content: '⚠️ The `open` option must be a category channel!', ephemeral: true });
        }

        if (close.type !== ChannelType.GuildCategory) {
            return await interaction.reply({ content: '⚠️ The `close` option must be a category channel!', ephemeral: true });
        }
//Murat Eren
        const data = {
            channel: channel.id,
            role: role.id,
            open: open.id,
            close: close.id
        };

        fs.writeFileSync(`./database/${interaction.guildId}.json`, JSON.stringify(data, null, 4));

        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket System')
            .setDescription('Click on the button below to create a ticket')
            .setColor('#6104b9')
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('📩 Create Ticket')
                    .setStyle(ButtonStyle.Primary)
            );
//Murat Eren
        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ The ticket system has been setup', ephemeral: true });
    }
}