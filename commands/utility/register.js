const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const http = require('http');
const { JSDOM } = require("jsdom")

async function get_data(id) {
	return new Promise((resolve, reject) => {
		const data = [];

		const req = http.request(`http://www.uschess.org/msa/thin.php?${id}`, res => {
			res.on('data', _ => data.push(_))
			res.on('end', () => resolve(data.join()))
		});
	
		req.end();
	})
}

async function get_name(id) {
	const HTML = await get_data(id);

	const dom = new JSDOM(HTML, {
		runScripts: "dangerously",
		resources: "usable"
	});

	let name = dom.window.document.querySelector('[name=memname]').value;

	return name
}

function fix_capitalization(name) {
	let n = name.split(" ")

	n.forEach( (l, i) => { n[i] = l[0] + l.substr(1).toLowerCase() })

	return n.join(" ");
}

async function register(interaction) {
	await interaction.reply({ content: 'Searching for person ... ', ephemeral: true });

	const id = interaction.options.getInteger('uscf_id');

	let name = fix_capitalization(await get_name(id));

	const confirm = new ButtonBuilder()
		.setCustomId('confirm')
		.setLabel('Yes, register them')
		.setStyle(ButtonStyle.Success);

	const cancel = new ButtonBuilder()
		.setCustomId('cancel')
		.setLabel('No, wrong person')
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder()
		.addComponents(confirm, cancel);

	await interaction.editReply({ 
		content: `Are you looking for ${name}?`,  
		components: [row],
	})
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Adds a player to the leaderboard')
		.addIntegerOption(option =>
			option.setName('uscf_id')
			.setRequired(true)
			.setDescription('Adds a player to the leaderboard')
		),
	async execute(interaction) {
		register(interaction)
	},
};
