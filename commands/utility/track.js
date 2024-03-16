const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Adds a new metric to track'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};