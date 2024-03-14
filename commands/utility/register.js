let { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
let http = require('http');
let { JSDOM } = require('jsdom')

async function get_website(id) {
	return new Promise((resolve, reject) => {
		let data = [];

		let req = http.request(`http://www.uschess.org/msa/thin.php?${id}`, res => {
			res.on('data', _ => data.push(_))
			res.on('end', () => resolve(data.join()))
		});
	
		req.end();
	})
}

async function get_player(id) {
	let HTML = await get_website(id);

	let dom = new JSDOM(HTML, {
		runScripts: 'dangerously',
		resources: 'usable'
	});

	let name = dom.window.document.querySelector('[name=memname]').value;
	let rating = dom.window.document.querySelector('[name=rating1]').value;

	rating = rating.slice(0, rating.indexOf('\*'))

	return [name, rating]
}

function fix_capitalization(name) {
	let n = name.split(' ')

	n.forEach( (l, i) => { n[i] = l[0] + l.substr(1).toLowerCase() })

	return n.join(' ');
}

function save_player(data) {
	fs = require('fs');

	let file_name = 'players.json';

	let m = JSON.parse(fs.readFileSync(file_name).toString());

	m[data[0]] = { 'name': data[1], 'rating': data[2], 'affiliation': data[3] };

	fs.writeFileSync(file_name, JSON.stringify(m));
}

async function register(interaction) {
	await interaction.reply({ content: 'Searching for person ... ', ephemeral: true });

	let id = interaction.options.getInteger('uscf_id');
	let affiliation = interaction.options.getString('affiliation');

	let player_info = await get_player(id);

	let name = fix_capitalization(player_info[0]);

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
			save_player([id, name, player_info[1], affiliation]);

			await confirmation.update({ content: 'Confirmed', components: [] });
		} else if (confirmation.customId === 'cancel') {
			await confirmation.update({ content: 'Cancelled', components: [] });
		}
	} catch (e) {
		await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Adds a player to the leaderboard')
		.addIntegerOption(option =>
			option.setName('uscf_id')
			.setRequired(true)
			.setDescription('The player\'s USCF id number')
		)
		.addStringOption(option =>
			option.setName('affiliation')
			.setRequired(true)
			.setDescription('The club, school, or organization the player belongs to.')
		),
	async execute(interaction) {
		register(interaction)
	},
};
