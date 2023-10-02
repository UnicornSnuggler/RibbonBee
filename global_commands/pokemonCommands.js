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
        .addIntegerOption(option =>
            option
                .setName('origin')
                .setDescription('The generation in which the prospective Pokémon originates.')
                .setRequired(false)
                .addChoices(
                    { name: 'Generation 3 (FireRed, LeafGreen, Colosseum, XD: Gale of Darkness, Ruby, Sapphire, Emerald)', value: 3 },
                    { name: 'Generation 4 (HeartGold, SoulSilver, Diamond, Pearl, Platinum)', value: 4 },
                    { name: 'Generation 5 (Black, White, Black 2, White 2)', value: 5 },
                    { name: 'Generation 6 (X, Y, Omega Ruby, Alpha Sapphire)', value: 6 },
                    { name: 'Generation 7 (Sun, Moon, Ultra Sun, Ultra Moon, Let\'s Go, Pikachu!, Let\'s Go, Eevee!)', value: 7 },
                    { name: 'Generation 8 (Sword, Shield, Brilliant Diamond, Shining Pearl, Legends: Arceus)', value: 8 },
                    { name: 'Generation 9 (Scarlet, Violet)', value: 8 }
                ))
        .addBooleanOption(option =>
            option
                .setName('show-prevolutions')
                .setDescription('Include data pertaining to the prospective Pokémon\'s prevolutions.'))
        .addBooleanOption(option =>
            option
                .setName('verbose')
                .setDescription('Include a detailed breakdown of attainable ribbons by game.')),
    async execute(interaction) {        
        try {
            let nameOption = interaction.options.getString('name').toLowerCase();
            let key = ConvertNameToKey(nameOption);
            
            let origin = interaction.options.getInteger('origin');

            let prevolutions = interaction.options.getBoolean('show-prevolutions') ?? false;
            let verbose = interaction.options.getBoolean('verbose') ?? false;

            let pokemonData = GetPokemonData(nameOption);

            if (!pokemonData) SendContentAsEmbed(interaction, `'${nameOption}' (\`${key}\`) could not be found...`);
            else SendMessageWithOptions(interaction, { embeds: [CreatePokemonEmbed(key, pokemonData, origin, prevolutions, verbose)] });
        }
        catch (error) {
            ReportError(interaction, error);
        }
    }
}