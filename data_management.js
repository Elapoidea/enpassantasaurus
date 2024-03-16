let { get_player_rating } = require('./uscf_api');
let { read_json, write_json } = require('./utils');

async function update_rating(data, name, id) {
	data[name]['rating'] = await get_player_rating(id);
}

async function save_player(name, id, affiliation) {
	let data = read_json('registry');
		
	if (Object.keys(data).includes(name)) {
		await confirmation.update({ content: `${name} has already been added`, components: [] });
		return;
	}

	data[name] = { 'uscf': id, 'affiliation': affiliation};

	await update_rating(data, name, id, affiliation)

	write_json('registry', data);
}

async function update_all_players() {
	let r = read_json('registry');

	for (i of Object.entries(r)) {
		await update_rating(r, i[0], i[1]['uscf']);
		console.log(`Updated ${i[0]}`);
	}

	write_json('registry', r);
}

function add_metric() {

}

module.exports = {update_rating, save_player, update_all_players, add_metric}