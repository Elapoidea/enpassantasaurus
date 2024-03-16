const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder,StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createCanvas } = require('canvas');
let { read_json } = require('../../utils');

function get_players() {
	let m = Object.entries(read_json('registry'))

	return m;
}

function arranged_data() {
	let l = get_players().map(i => [i[0], i[1].rating, i[1].affiliation]);

	l.sort((a, b) => { return b[1] - a[1] });

	return l;
}

function transpose(data) {
	return data[0].map((col, i) => data.map(row => row[i]));
}

function merge_data(data) {
	let merged = '\`\`\`';

	for (i=0; i<data.length; i++) {
		// let n = data[i][0].slice(0, data[i][0].indexOf(' ') + 2)
		let n = data[i][0]

		merged += `${i+1}. ${n} ${' '.repeat(20 - n.length)} ${data[i][1]} (${data[i][2]})\n`;
	}

	merged += '\`\`\`';

	return merged;
}

async function leaderboard(interaction) {
	let metric = interaction.options.getString('metric');

	let data = get_players();

	data.sort((a, b) => { return b[1][metric] - a[1][metric] });

	let canvas = createCanvas(3000, 1550);
	let ctx = canvas.getContext('2d');

	ctx.font = 'bold 120px Arial';
	ctx.fillStyle = '#FFFFFF';
	ctx.textBaseline = 'top';

	ctx.fillText(`NAME`, 0, 0);
	ctx.fillText(metric.toUpperCase(), 1200, 0);
	ctx.fillText(`GROUP`, 2500, 0);

	let i = 0

	for (d of data) {
		let n = data[i][0];
		let m = data[i][1][metric];
		let a = data[i][1]['affiliation'];

		if (m == -1) {
			continue;
		}

		let y = 2000 / 15 * i + 150;

		ctx.fillText(`${i+1}. ${n}`, 0, y);
		ctx.fillText(`${m}`, 1200, y);
		ctx.fillText(`${a}`, 2500, y);

		i += 1;
	}

	let attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `leaderboard.png` });

	const exampleEmbed = new EmbedBuilder()
		.setTitle('Leaderboard')
		.setColor(0x004088)
		.setImage('attachment://leaderboard.png')

	const select = new StringSelectMenuBuilder()
		.setCustomId('starter')
		.setPlaceholder('Make a selection!')
		.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel('Bulbasaur')
				.setDescription('The dual-type Grass/Poison Seed Pokémon.')
				.setValue('bulbasaur'),
			new StringSelectMenuOptionBuilder()
				.setLabel('Charmander')
				.setDescription('The Fire-type Lizard Pokémon.')
				.setValue('charmander'),
			new StringSelectMenuOptionBuilder()
				.setLabel('Squirtle')
				.setDescription('The Water-type Tiny Turtle Pokémon.')
				.setValue('squirtle'),
		);

	for (i of ['rating', 'test', 'blitz']) {
		select.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(i)
				.setDescription(i)
				.setValue(i)
		)
	}

	const row = new ActionRowBuilder()
		.addComponents(select);


	await interaction.reply({ content: '', embeds: [exampleEmbed], ephemeral: true, files: [attachment], components: [row] });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays a leaderboard')
		.addStringOption(option =>
			option.setName('metric')
			.setRequired(true)
			.setDescription('The metric to use to determine the rankings.')),
	async execute(interaction) {
		leaderboard(interaction);
	},
};


