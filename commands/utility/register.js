const { SlashCommandBuilder } = require('discord.js');
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

	console.log(name)

	return name
}

async function register(interaction) {
	const id = interaction.options.getInteger('uscf_id');

	console.log(await get_name(id));

	interaction.reply({ content: `http://www.uschess.org/msa/thin.php?${id}`, ephemeral: true });
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
		await interaction.reply({ content: 'Searching for person ... ', ephemeral: true });

		// await register(interaction)
		const id = interaction.options.getInteger('uscf_id');

		let name = await get_name(id);
	
		await interaction.editReply({ content: `Are you looking for ${name}`,  })
	},
};
