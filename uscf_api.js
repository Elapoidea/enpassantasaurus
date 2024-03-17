let http = require('http');
let { JSDOM } = require('jsdom');

async function get_tournaments_page(id) {
	return new Promise((resolve, reject) => {
		let data = [];

		let req = http.request(`http://www.uschess.org/msa/MbrDtlTnmtHst.php?${id}`, res => {
			res.on('data', _ => data.push(_))
			res.on('end', () => resolve(data.join()))
		});
	
		req.end();
	})
}

async function get_thin_website(id) {
	return new Promise((resolve, reject) => {
		let data = [];

		let req = http.request(`http://www.uschess.org/msa/thin.php?${id}`, res => {
			res.on('data', _ => data.push(_))
			res.on('end', () => resolve(data.join()))
		});
	
		req.end();
	})
}

async function get_player_rating(id) {
	console.log(id);

	if (id == 0) {
		return 0;
	}

	let HTML = await get_tournaments_page(id);
	
	let dom = new JSDOM(HTML, {
		runScripts: 'dangerously',
		resources: 'usable'
	});

	let tournaments = Object.values(dom.window.document.querySelectorAll('td')).filter((t) => t.width == 160)
	let latest = tournaments[0].innerHTML;
	let rating = latest.slice(4).replace(/\D/g,'');

	return rating;
}

async function get_player_name(id) {
	let HTML = await get_thin_website(id);

	let dom = new JSDOM(HTML, {
		runScripts: 'dangerously',
		resources: 'usable'
	});

	let name = dom.window.document.querySelector('[name=memname]').value.split(' ');

	name.forEach( (l, i) => { name[i] = l[0] + l.substr(1).toLowerCase() })

	let n = name.join(' ')

	let non_alphabetic_index = n.search(/[^A-Za-z]/);
	let space_index = n.lastIndexOf(' ');

	n = n.slice(0, non_alphabetic_index) + n.slice(space_index, space_index + 2);

	return n;
}

module.exports = { get_player_name, get_player_rating }