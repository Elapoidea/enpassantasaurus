const { Events } = require('discord.js');

async function command(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}

async function button(i) {
    // await i.deferUpdate()

    // if (i.customId == 'l_metric') {
    //     metric = i.values[0];
    // }

    // if (i.customId == 'l_affiliation') {
    //     affiliation = i.values[0];
    // }

    // if (i.customId == 'l_up') {
    //     start = Math.max(start - 8, 0)
    // }

    // if (i.customId == 'l_down') {
    //     start += 8
    // }

    // if (i.customId == 'l_full_up') {
    //     start = 0;
    // }

    // if (i.customId == 'l_full_down') {
    //     start = Math.max(read_json('general')['total_players'] - 10, 0);
    // }

    // let settings = [metric, affiliation, start, use_metric_dropdown, use_affiliation_dropdown, use_starting_place, private];
    // await interaction.editReply(generate_response(...settings));

}

async function sort_interaction(interaction) {
    if (interaction.isChatInputCommand()) return command;
    if (interaction.isButton()) return (_) => { };
    if (interaction.isStringSelectMenu()) return (_) => { };
}

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		await (await sort_interaction(interaction))(interaction);
	},
};