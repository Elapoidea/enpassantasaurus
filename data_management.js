let { get_player_rating } = require('./uscf_api');
let { read_json, write_json } = require('./utils');


async function save_player(data, name, id, affiliation) {
	data[name] = { 'uscf': id, 'affiliation': affiliation};

	await update_rating(data, [name, data[name]]);

	let m = read_json('metrics');

	for (i of Object.entries(m)) {
        data[name][i[0]] = i[1];
	}

	write_json('metrics', m);
}

async function update_all_players(f) {
	let r = read_json('registry');

	for (i of Object.entries(r)) {
        await f(r, i);
	}

	write_json('registry', r);
}

async function update_rating(data, datum) {
	data[datum[0]]['rating'] = await get_player_rating(datum[1]['uscf']);
}

async function update_all_ratings() {
    await update_all_players(update_rating);
}

async function add_metric(metric, default_value) {
	let m = read_json('metrics');

	m[metric] = default_value;

	write_json('metrics', m);

    await update_all_players((data, datum) => {
        data[datum[0]][metric] = default_value
    });
}

async function remove_metric(metric) {
	let m = read_json('metrics');

	delete m[metric];

	write_json('metrics', m);

    await update_all_players((data, datum) => {
        delete data[datum[0]][metric]
    });
}

async function update_player(name, f) {
	let r = read_json('registry');

	await f(r, [name, r[name]]);

	write_json('registry', r);
}

async function add_score(metric, amount, name) {
	await  update_player(name, (data, datum) => {
		data[datum[0]][metric] += amount
	})
}

async function subtract_score(metric, amount, name) {
	await  update_player(name, (data, datum) => {
		data[datum[0]][metric] -= amount
	})
}

async function set_score(metric, amount, name) {
	await  update_player(name, (data, datum) => {
		data[datum[0]][metric] = amount
	})
}

module.exports = {
    update_rating, 
    save_player, 
    update_all_players, 
    add_metric,
	remove_metric,
    update_all_ratings,
	add_score,
	subtract_score,
	set_score,
}