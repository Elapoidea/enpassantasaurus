const { SlashCommandBuilder } = require('discord.js');

function register(interaction) {
	const id = interaction.options.getInteger('uscf_id');

	const http = require('http');

	//https://www.uschess.org/msa/thin.php?30656638
	const req = http.request(`http://www.uschess.org/msa/thin.php?${id}`, res => {
		const data = [];

		res.on('data', _ => data.push(_))
		res.on('end', () => console.log(data.join()))
	});

	req.end();

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
		await register(interaction)
	},
};
