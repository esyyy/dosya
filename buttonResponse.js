const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const button = interaction.customId;
        const user = interaction.user;
        const guild = interaction.guild;

        const date = JSON.parse(fs.readFileSync(`./database/${guild.id}.json`));
        const staffRole = date.role;
        const openCategory = date.open;
        const closeCategory = date.close;

        const errorEmbed = new EmbedBuilder()
            .setTitle('⚠️ Error')
            .setColor('#FF0000')
            .setTimestamp();

        if (!guild.roles.cache.get(staffRole)) {
            errorEmbed.setDescription('The staff role has been deleted.\nPlease use the command `/setup` to reconfigure the bot.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!guild.channels.cache.get(openCategory)) {
            errorEmbed.setDescription('The open tickets category has been deleted.\nPlease use the command `/setup` to reconfigure the bot.');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!guild.channels.cache.get(closeCategory)) {
            errorEmbed.setDescription('The close tickets category has been deleted.\nPlease use the command `/setup` to reconfigure the bot.');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (button == 'create_ticket') {
            const channel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                parent: openCategory,
                topic: `${user.username} ${user.id}`,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: PermissionFlagsBits.ViewChannel
                    },
                    {
                        id: user.id,
                        allow: PermissionFlagsBits.ViewChannel
                    },
                    {
                        id: staffRole,
                        allow: PermissionFlagsBits.ViewChannel
                    }
                ]
            });
            
            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Ticket System')
                .setDescription(`Hello <@${user.id}>, welcome to your ticket!\nPlease wait for a <@&${staffRole}> reply.`)
                .setColor('#6104b9')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('📩 Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.send({ embeds: [ticketEmbed], components: [row] });
            await interaction.reply({ content: `✅ Your ticket has been created in ${channel}`, ephemeral: true });
        } else if (button == 'close_ticket') {
            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Ticket System')
                .setDescription(`Hello <@${user.id}>, are you sure you want to close this ticket?`)
                .setColor('#e00000')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_close_ticket')
                        .setLabel('✅ Confirm')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancel_close_ticket')
                        .setLabel('❌ Cancel')
                        .setStyle(ButtonStyle.Danger)
                );
                
            await interaction.update({ embeds: [ticketEmbed], components: [row] });
        } else if (button == 'confirm_close_ticket') {
            const channel = interaction.channel;
            const username = channel.topic.split(' ')[0];

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Ticket System')
                .setDescription(`This ticket has been closed by <@${user.id}>.`)
                .setColor('#e00000')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('delete_ticket')
                        .setLabel('🗑️ Delete Ticket')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('reopen_ticket')
                        .setLabel('🔓 Reopen Ticket')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('transcript_ticket')
                        .setLabel('📄 Transcript')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.update({ embeds: [ticketEmbed], components: [row] });

            await channel.setParent(closeCategory);
            await channel.setName(`closed-${username}`);
            await channel.setParent(closeCategory);
            await channel.permissionOverwrites.edit(guild.id, {
                SendMessages: false,
                ViewChannel: false
            });
        } else if (button == 'cancel_close_ticket') {
            const channel = interaction.channel;
            const userid = channel.topic.split(' ')[1];

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Ticket System')
                .setDescription(`Hello <@${userid}>, welcome to your ticket!\nPlease wait for a <@&${staffRole}> reply.`)
                .setColor('#6104b9')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('📩 Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.update({ embeds: [ticketEmbed], components: [row] });
        } else if (button == 'delete_ticket') {
            const channel = interaction.channel;

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Ticket System')
                .setDescription(`This ticket will be deleted in 5 seconds.`)
                .setColor('#e00000')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.update({ embeds: [ticketEmbed], components: [] });
            setTimeout(() => {
                channel.delete();
            }, 5000);
        } else if (button == 'reopen_ticket') {
            const channel = interaction.channel;
            const username = channel.topic.split(' ')[0];
            const userid = channel.topic.split(' ')[1];

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Ticket System')
                .setDescription(`Hello <@${userid}>, your ticket has been reopened.\nPlease wait for a <@&${staffRole}> reply.`)
                .setColor('#6104b9')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('📩 Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.setParent(openCategory);
            await channel.setName(`ticket-${username}`);
            await channel.permissionOverwrites.edit(userid, {
                SendMessages: true,
                ViewChannel: true
            });
            await interaction.update({ embeds: [ticketEmbed], components: [row] });
        } else if (button == 'transcript_ticket') {
            const channel = interaction.channel;
            const messages = await channel.messages.fetch();
            const contentHandler = `Transcript for ${channel.name} (${channel.id})\n\n`;
            const content = messages.map(m => `[${m.createdAt.toLocaleDateString()} ${m.createdAt.toLocaleTimeString()}] ${m.author.tag}: ${m.content}`).join('\n');

            const transcript = new AttachmentBuilder()
                .setName(`transcript-${channel.name}.txt`)
                .setFile(Buffer.from(contentHandler + content));
            
            await interaction.reply({ content: `📩 Your transcript is ready.`, files: [transcript] });
        }
    }
}