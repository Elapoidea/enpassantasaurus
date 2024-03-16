const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
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
	let data = arranged_data();

	let canvas = createCanvas(3000, 1500);
	let ctx = canvas.getContext('2d');

	ctx.font = 'bold 120px Arial';
	ctx.fillStyle = '#FFFFFF';
	ctx.textBaseline = 'top';

	ctx.fillText(`Name`, 0, 0);
	ctx.fillText(`Rating`, 1200, 0);
	ctx.fillText(`Score`, 1700, 0);
	ctx.fillText(`Group `, 2200, 0);

	ctx.font = '120px Arial';

	for (i=0; i<data.length; i++) {
		let full_name = data[i][0]
		let non_alphabetic_index = full_name.search(/[^A-Za-z]/);
		let space_index = full_name.indexOf(' ');
		let n = full_name.slice(0, non_alphabetic_index) + full_name.slice(space_index, space_index + 2);

		let y = 2000 / 15 * i + 200;

		ctx.fillText(`${i+1}. ${n}`, 0, y);
		ctx.fillText(`${data[i][1]}`, 1200, y);
		ctx.fillText(`${data[i][3]}`, 1700, y);
		ctx.fillText(`${data[i][2]} `, 2200, y);
	}

	let attachment = new AttachmentBuilder(canvas.toBuffer(), { name: `leaderboard.png` });

	const exampleEmbed = new EmbedBuilder()
		// .addFields(
		// 	{ name: 'Name', value: ' ', inline: true },
		// 	{ name: 'Rating', value: ' ', inline: true },
		// 	{ name: 'Affiliation', value: ' ', inline: true },
		// 	// { name: ' ', value: data[0].join('\n'), inline: true },
		// 	// { name: ' ', value: data[1].join('\n'), inline: true },
		// 	// { name: ' ', value: data[2].join('\n'), inline: true },
			
		// )
		.setTitle('Leaderboard')
		.setColor(0x004088)
		.setTimestamp()
		.setImage('attachment://leaderboard.png')

	// for (i of data) {
	// 	exampleEmbed.addFields(	{ name: ' ', value: i, inline: false });
	// }

	// exampleEmbed.addFields(	{ name: ' ', value: data, inline: false });

	await interaction.reply({ content: '', embeds: [exampleEmbed], ephemeral: true, files: [attachment] });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		leaderboard(interaction);
	},
};