const { Client } = require('discord.js-selfbot-v13');
const http = require('http');

const TOKEN = process.env.DISCORD_TOKEN || '';
const GUILD_ID = process.env.GUILD_ID || '';
const CHANNEL_ID = process.env.CHANNEL_ID || '';
const PORT = process.env.PORT || 8080;

if (!TOKEN || !GUILD_ID || !CHANNEL_ID) {
    console.error('[VOICE] Missing env vars');
    process.exit(1);
}

const client = new Client({ checkUpdate: false });
let voiceConnection = null;

async function joinVoice() {
    try {
        const guild = client.guilds.cache.get(GUILD_ID) || await client.guilds.fetch(GUILD_ID).catch(() => null);
        if (!guild) return false;
        
        const channel = await guild.channels.fetch(CHANNEL_ID).catch(() => null);
        if (!channel || !channel.isVoice()) return false;

        voiceConnection = await client.voice.joinChannel(channel, { selfDeaf: true, selfMute: false });
        
        voiceConnection.on('disconnect', () => { voiceConnection = null; setTimeout(joinVoice, 5000); });
        return true;
    } catch (e) {
        setTimeout(joinVoice, 5000);
        return false;
    }
}

client.on('ready', async () => { await joinVoice(); });
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.id === client.user?.id && !newState.channelId) {
        voiceConnection = null;
        setTimeout(joinVoice, 5000);
    }
});

const server = http.createServer((req, res) => { res.writeHead(200); res.end('OK'); });
server.listen(PORT);

client.login(TOKEN);