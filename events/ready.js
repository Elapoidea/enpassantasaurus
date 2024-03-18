let { Events } = require('discord.js');
let { read_json, write_json } = require('../utils');
let { update_all_ratings } = require('../data_management');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
        console.log(`${client.user.tag} is now online.`);

        let g = read_json('general');
    
        let d = new Date().getDate();
    
        if (g['last_update'] != d) {
            g['last_update'] = d;
    
            console.log('Updating data ...');
            let start_time = performance.now();
    
            await update_all_ratings();
    
            console.log(`Data has been updated in ${Math.round((performance.now() - start_time)/100)/10} seconds.`);
        }
    
        write_json('general', g);
	},
};

