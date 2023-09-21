const { SlashCommandBuilder } = require('discord.js');
const { GetPokemonData, ConvertNameToKey, CreatePokemonEmbed } = require('../utilities/pokemonHelper');
const { SendContentAsEmbed, SendMessageWithOptions } = require('../utilities/messageHelper');
const { ReportError } = require('../utilities/errorHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokemon')
        .setDescription('Query for Pokémon as prospective ribbon masters.')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('The name of the prospective Pokémon.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('origin')
                .setDescription('The game in which the prospective Pokémon originates.')
                .setRequired(false)
                .addChoices(
                    { name: 'FireRed/LeafGreen', value: 'frlg' },
                    { name: 'Colosseum/XD: Gale of Darkness', value: 'cxgod' },
                    { name: 'Ruby/Sapphire/Emerald', value: 'rse' },
                    { name: 'HeartGold/SoulSilver', value: 'hgss' },
                    { name: 'Diamond/Pearl/Platinum', value: 'dpp' },
                    { name: 'Black/White', value: 'bw' },
                    { name: 'Black 2/White 2', value: 'b2w2' },
                    { name: 'X/Y', value: 'xy' },
                    { name: 'Omega Ruby/Alpha Sapphire', value: 'oras' },
                    { name: 'Sun/Moon', value: 'sm' },
                    { name: 'Ultra Sun/Ultra Moon', value: 'usum' },
                    { name: 'Legends: Arceus', value: 'pla' },
                    { name: 'Let\'s Go, Pikachu!/Let\'s Go, Eevee!', value: 'lgplge' },
                    { name: 'Brilliant Diamond/Shining Pearl', value: 'bdsp' },
                    { name: 'Sword/Shield', value: 'swsh' },
                    { name: 'Scarlet/Violet', value: 'sv' }
                )),
    async execute(interaction) {        
        try {
            let origin = interaction.options.getString('origin');
            let nameOption = interaction.options.getString('name').toLowerCase();
            let key = ConvertNameToKey(nameOption);

            let pokemonData = GetPokemonData(nameOption);

            if (!pokemonData) SendContentAsEmbed(interaction, `'${nameOption}' (\`${key}\`) could not be found...`);
            else SendMessageWithOptions(interaction, { embeds: [CreatePokemonEmbed(key, pokemonData)] });
        }
        catch (error) {
            ReportError(interaction, error);
        }
    }
}