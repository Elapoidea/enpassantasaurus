const { SlashCommandBuilder } = require('discord.js');
let { add_score, subtract_score, set_score } = require('../../data_management');

async function add(interaction) {
	let metric = interaction.options.getString('metric');
	let amount = interaction.options.getInteger('amount');
	let name = interaction.options.getString('name');

	add_score(metric, amount, name)

	await interaction.reply({ content: `${amount} has been added to ${name}\'s ${metric}.`, ephemeral: true });
}

async function subtract(interaction) {
	let metric = interaction.options.getString('metric');
	let amount = interaction.options.getInteger('amount');
	let name = interaction.options.getString('name');

	subtract_score(metric, amount, name)

	await interaction.reply({ content: `${amount} has been subtracted from ${name}\'s ${metric}.`, ephemeral: true });
}

async function set(interaction) {
	let metric = interaction.options.getString('metric');
	let amount = interaction.options.getInteger('amount');
	let name = interaction.options.getString('name');

	set_score(metric, amount, name)

	await interaction.reply({ content: `${name}\'s ${metric} has been set to ${amount}.`, ephemeral: true });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('score')
		.setDescription('Modifies a metric of a specific player.')
		.addSubcommand(subcommand =>
			subcommand
			.setName('add')
			.setDescription('Adds to the metric')
			.addStringOption(option =>
				option.setName('metric')
				.setDescription('filler')
				.setRequired(true))
			.addIntegerOption(option =>
				option.setName('amount')
				.setDescription('filler')
				.setRequired(true))
			.addStringOption(option =>
				option.setName('name')
				.setDescription('filler')
				.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
			.setName('subtract')
			.setDescription('Subtracts from the metric')
			.addStringOption(option =>
				option.setName('metric')
				.setDescription('filler')
				.setRequired(true))
			.addIntegerOption(option =>
				option.setName('amount')
				.setDescription('filler')
				.setRequired(true))
			.addStringOption(option =>
				option.setName('name')
				.setDescription('filler')
				.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
			.setName('set')
			.setDescription('Sets the metric')
			.addStringOption(option =>
				option.setName('metric')
				.setDescription('filler')
				.setRequired(true))
			.addIntegerOption(option =>
				option.setName('amount')
				.setDescription('filler')
				.setRequired(true))
			.addStringOption(option =>
				option.setName('name')
				.setDescription('filler')
				.setRequired(true))),
	async execute(interaction) {
		let sc = interaction.options.getSubcommand()

		if (sc == 'add') {
			add(interaction);
		}
		
		if (sc == 'subtract') {
			subtract(interaction);
		}

		if (sc == 'set') {
			set(interaction);
		}
	},
};