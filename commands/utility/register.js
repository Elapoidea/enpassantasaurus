let { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

let { get_player_name, get_player_rating } = require('../../uscf_api');
let { read_json, write_json } = require('../../utils');
let { save_player } = require('../../data_management');

async function uscf(interaction) {
	await interaction.reply({ content: 'Searching for person ... ', ephemeral: true });

	let id = interaction.options.getInteger('uscf_id');
	let affiliation = interaction.options.getString('affiliation');
	let name = await get_player_name(id);

	let confirm = new ButtonBuilder()
		.setCustomId('confirm')
		.setLabel('Yes, register them')
		.setStyle(ButtonStyle.Success);

	let cancel = new ButtonBuilder()
		.setCustomId('cancel')
		.setLabel('No, wrong person')
		.setStyle(ButtonStyle.Danger);

	let row = new ActionRowBuilder()
		.addComponents(confirm, cancel);

	let response = await interaction.editReply({ 
		content: `Are you looking for ${name}?`,  
		components: [row],
	})

	let collectorFilter = i => i.user.id === interaction.user.id;

	try {
		const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
	
		if (confirmation.customId === 'confirm') {
			save_player(name, id, affiliation);

			await confirmation.update({ content: 'Confirmed', components: [] });
		} else if (confirmation.customId === 'cancel') {
			await confirmation.update({ content: 'Cancelled', components: [] });
		}
	} catch (e) {
		console.log(e);
		await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
	}
}

async function unrated(interaction) {
	let name = `${interaction.options.getString('first_name')} ${interaction.options.getString('last_initial')}`;
	let affiliation = interaction.options.getString('affiliation');

	save_player(name, 0, affiliation);

	await interaction.reply({ content: `Added ${name}`, ephemeral: true });
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Adds a player to the leaderboard')
		.addSubcommand(subcommand =>
			subcommand
				.setName('uscf')
				.setDescription('The player has a USCF membership')
				.addIntegerOption(option =>
					option.setName('uscf_id')
					.setRequired(true)
					.setDescription('The player\'s USCF id number'))
				.addStringOption(option =>
					option.setName('affiliation')
					.setRequired(true)
					.setDescription('The club, school, or organization the player belongs to.')
				))
		.addSubcommand(subcommand =>
			subcommand
			.setName('unrated')
			.setDescription('The player is unrated')
			.addStringOption(option =>
				option.setName('first_name')
				.setRequired(true)
				.setDescription('The player\'s first name'))
			.addStringOption(option =>
				option.setName('last_initial')
				.setRequired(true)
				.setDescription('The player\'s last initial'))
			.addStringOption(option =>
				option.setName('affiliation')
				.setRequired(true)
				.setDescription('The club, school, or organization the player belongs to.')
			)),
	async execute(interaction) {
		let sc = interaction.options.getSubcommand()

		if (sc == 'uscf') {
			uscf(interaction);
		}
		
		if (sc == 'unrated') {
			unrated(interaction);
		}
	},
};
