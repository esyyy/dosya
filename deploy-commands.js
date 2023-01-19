const { REST } = require('@discordjs/rest'); 
const { Routes } = require('discord.js');
const fs = require('fs');
const {token, clientID} =  require('./config.json'); 
//Murat Eren
exports.DeployCommands = async () => { 
//Murat Eren
    const commands = [];  
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); 
    //Murat Eren
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }
//Murat Eren
//Murat Eren
    const rest = new REST({ version: '10' }).setToken(token); 
    //Murat Eren
    console.log('[DEPLOY] Deploying commands...'.yellow);
    (async () => {
        try {
            console.log('[DEPLOY] Started refreshing application (/) commands.'.blue);
            await rest.put(
                Routes.applicationCommands(clientID),
                { body: commands },
            );
            console.log('[DEPLOY] Successfully reloaded application (/) commands.'.green);
        } catch (error) {
            console.error(`[DEPLOY] Error while refreshing application (/) commands: ${error}`.red);
        }
    })();
}