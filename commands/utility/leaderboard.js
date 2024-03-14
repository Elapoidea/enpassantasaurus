const { SlashCommandBuilder } = require('discord.js');

function get_players() {
	fs = require('fs');

	let file_name = 'players.json';

	let m = Object.values(JSON.parse(fs.readFileSync(file_name).toString()))

	console.log(m)

	return m;
}

function construct_leaderboard() {
	let l = '';

	for (const [i, p] of get_players().entries()) {
		l += `${i}. ${p[0]} (${p[1]})\n`;
	}

	return l;
}

async function leaderboard(interaction) {
	await interaction.reply(construct_leaderboard());
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		leaderboard(interaction);
	},
};