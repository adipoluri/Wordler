require('dotenv').config(); //initialize dotenv
const {Client, Intents} = require('discord.js'); //import discord.js
const { commands } = require('./commands');
var Corpus = require('./corpus');



const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_PRESENCES] }); //create new client


//Bot Data
const prefix = "!";
const lobbies = {};
const words = {};
Corpus.loadCorpus(words);


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


//Bot Logic
  
const executeCommand = (msg, command) => {
    const commandFunc = commands[command.command];
    if (commandFunc != null) {

      const reply = commandFunc(msg, command.args, words, lobbies);
      msg.delete();
    }
};


client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    if(!msg.content.startsWith(prefix) && msg.channel.isThread()) {
        if (lobbies[msg.channel.id] != null) {
            msg.delete();
        }
    }

    if (!msg.content.startsWith(prefix)) return;
  
    const commandBody = msg.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    
    
    try {
        await executeCommand(msg, {command: command,args: args});
    } catch (error) {
        console.log(error);
    }

    
});

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token