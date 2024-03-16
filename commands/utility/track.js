const { SlashCommandBuilder } = require('discord.js');
let { add_metric, remove_metric } = require('../../data_management');


async function add(interaction) {
	let metric = interaction.options.getString('metric');
	let default_value = interaction.options.getInteger('default');

	add_metric(metric, default_value)

	await interaction.reply({ content: `${metric} is now being tracked, and all players have been given the value of ${default_value}`, ephemeral: true });
}

async function remove(interaction) {
	let metric = interaction.options.getString('metric');

	remove_metric(metric)

	await interaction.reply({ content: `${metric} is no longer being tracked.`, ephemeral: true });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Adds a new metric to track')
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a new metric to track.')
				.addStringOption(option =>
					option.setName('metric')
					.setRequired(true)
					.setDescription('The metric to track.'))
				.addIntegerOption(option =>
					option.setName('default')
					.setRequired(true)
					.setDescription('The default value for players. (Players with a value of -1 do not show on leaderboards)')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a metric.')
				.addStringOption(option =>
					option.setName('metric')
					.setRequired(true)
					.setDescription('The metric to remove.'))),
	async execute(interaction) {
		let sc = interaction.options.getSubcommand()

		if (sc == 'add') {
			add(interaction);
		}
		
		if (sc == 'remove') {
			remove(interaction);
		}
	},
};