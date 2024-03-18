const { 
	SlashCommandBuilder, 
	EmbedBuilder, 
	AttachmentBuilder, 
	ActionRowBuilder,
	StringSelectMenuBuilder, 
	StringSelectMenuOptionBuilder, 
	ComponentType,
	ButtonBuilder,
	ButtonStyle, 
} = require('discord.js');
const { createCanvas } = require('canvas');
let { read_json } = require('../../utils');

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

function draw_image(data, metric, start) {
	let canvas = createCanvas(3000, 1500);
	let ctx = canvas.getContext('2d');

	ctx.font = 'bold 120px Arial';
	ctx.fillStyle = '#FFFFFF';
	ctx.textBaseline = 'top';

	ctx.fillText(`NAME`, 0, 0);
	ctx.fillText(metric.toUpperCase(), 1200, 0);
	ctx.fillText(`GROUP`, 2500, 0);

	let i = 0;
	let j = 0;

	start = Math.max(Math.min(start, data.length - 10), 0);

	let d = data.slice(start, start + 10)

	for (_ of d) {
		let n = d[i][0];
		let m = d[i][1][metric];
		let a = d[i][1]['affiliation'];

		i += 1;

		if (m == -1) {
			continue;
		}

		let y = 2000 / 15 * j + 150;

		ctx.fillText(`${j + start + 1}. ${n}`, 0, y);
		ctx.fillText(`${m}`, 1200, y);
		ctx.fillText(`${a}`, 2500, y);

		j += 1;
	}

	return new AttachmentBuilder(canvas.toBuffer(), { name: `leaderboard.png` });
}

function generate_embed() {
	return new EmbedBuilder()
	.setTitle('Leaderboard')
	.setColor(0x004088)
	.setImage('attachment://leaderboard.png')
}

function generate_metric_dropdown(default_selection) {
	let select = new StringSelectMenuBuilder()
		.setCustomId('metric')
		.setPlaceholder('Select a metric.');

	let o = Object.keys(read_json('metrics'));
	o.push('rating');

	for (i of o) {
		let a = new StringSelectMenuOptionBuilder().setLabel(i).setValue(i);

		if (i == default_selection) {
			a.setDefault(true);
		}

		select.addOptions(
			a
		)
	}

	return select
}

function generate_affiliation_dropdown(default_selection) {
	let select = new StringSelectMenuBuilder()
		.setCustomId('affiliation')
		.setPlaceholder('Filter by affiliation.');

	let o = Object.values(read_json('registry'));
	o = o.map((i) => { return i['affiliation'] });
	o = [...new Set(o)];
	o.sort();
	o.unshift('All');

	for (i of o) {
		let a = new StringSelectMenuOptionBuilder().setLabel(i).setValue(i);

		if (i == default_selection) {
			a.setDefault(true);
		}

		select.addOptions(
			a
		)
	}

	return select
}

function generate_response(metric, affiliation, start, use_metric_dropdown, use_affiliation_dropdown, use_starting_place, private) {
	let menus = [];

	if (!metric) {
		metric = 'rating';	
	}

	if (use_metric_dropdown) {
		menus.push(new ActionRowBuilder().addComponents(generate_metric_dropdown(metric)));
	}
	
	if (!affiliation) {
		affiliation = 'All';
	}
	
	if (use_affiliation_dropdown) {
		menus.push(new ActionRowBuilder().addComponents(generate_affiliation_dropdown(affiliation)));
	}

	let data = Object.entries(read_json('registry'));

	data = data.filter((i) => { return i[1]['affiliation'] == affiliation || affiliation == 'All' });
	data.sort((a, b) => { return b[1][metric] - a[1][metric] });

	let up = new ButtonBuilder()
		.setCustomId('up')
		.setLabel('🡅')
		.setStyle(ButtonStyle.Secondary);

	let down = new ButtonBuilder()
		.setCustomId('down')
		.setLabel('🡇')
		.setStyle(ButtonStyle.Secondary);

	let full_up = new ButtonBuilder()
		.setCustomId('full_up')
		.setLabel('⯭')
		.setStyle(ButtonStyle.Secondary);

	let full_down = new ButtonBuilder()
		.setCustomId('full_down')
		.setLabel('⯯')
		.setStyle(ButtonStyle.Secondary);

	let reload = new ButtonBuilder()
		.setCustomId('reload')
		.setLabel('↻')
		.setStyle(ButtonStyle.Secondary);

	if (use_starting_place) {
		menus.push(new ActionRowBuilder().addComponents(full_up, up, down, full_down, reload));

	}
	
	return { 
		content: '', 
		embeds: [generate_embed()], 
		ephemeral: private, 
		files: [draw_image(data, metric, start)], 
		components: menus,
	};
}

async function leaderboard(interaction, private) {
	let metric = interaction.options.getString('metric');
	let affiliation = interaction.options.getString('affiliation');
	let start = interaction.options.getInteger('start');
	let use_metric_dropdown = !metric;
	let use_affiliation_dropdown = !affiliation;
	let use_starting_place = !start;

	if (use_starting_place) {
		start = 0;
	} else {
		start -= 1;
	}

	let settings = [metric, affiliation, start, use_metric_dropdown, use_affiliation_dropdown, use_starting_place, private];
	let response = await interaction.reply(generate_response(...settings));

	const collector = response.createMessageComponentCollector({ time: 3_600_000 });

	collector.on('collect', async i => {
		await i.deferUpdate()

		if (i.customId == 'metric') {
			metric = i.values[0];
		}

		if (i.customId == 'affiliation') {
			affiliation = i.values[0];
		}

		if (i.customId == 'up') {
			start = Math.max(start - 8, 0)
		}

		if (i.customId == 'down') {
			start += 8
		}

		if (i.customId == 'full_up') {
			start = 0;
		}

		if (i.customId == 'full_down') {
			start = Math.max(read_json('general')['total_players'] - 10, 0);
		}

		let settings = [metric, affiliation, start, use_metric_dropdown, use_affiliation_dropdown, use_starting_place, private];
		await interaction.editReply(generate_response(...settings));
	});
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays a leaderboard')
		.addSubcommand(subcommand =>
			subcommand
			.setName('private')
			.setDescription('Creates a leaderboard that stops working after every restart.')
			.addStringOption(option =>
				option.setName('metric')
				.setRequired(false)
				.setDescription('The metric to use to determine the rankings.'))
			.addStringOption(option =>
				option.setName('affiliation')
				.setRequired(false)
				.setDescription('Show only people who are affiliated with a group.'))		
			.addIntegerOption(option =>
				option.setName('start')
				.setRequired(false)
				.setDescription('Which rank to start listing people from.')))
		.addSubcommand(subcommand =>
			subcommand
			.setName('public')
			.setDescription('Creates a leaderboard that remains useable in the future.')
			.addStringOption(option =>
				option.setName('metric')
				.setRequired(true)
				.setDescription('The metric to use to determine the rankings.'))
			.addStringOption(option =>
				option.setName('affiliation')
				.setRequired(true)
				.setDescription('Show only people who are affiliated with a group.'))		
			.addIntegerOption(option =>
				option.setName('start')
				.setRequired(true)
				.setDescription('Which rank to start listing people from.'))),
	async execute(interaction) {
		let sc = interaction.options.getSubcommand()

		if (sc == 'public') {
			leaderboard(interaction, false);
		}
		
		if (sc == 'private') {
			leaderboard(interaction, true);
		}
	},
};



