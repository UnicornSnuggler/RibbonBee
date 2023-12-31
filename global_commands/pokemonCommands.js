const { SlashCommandBuilder } = require('discord.js');

const { SPAM_CHANNELS } = require('../constants');

const { GetPokemonData, SearchByName } = require('../utilities/pokemonHelper');
const { SendContentAsEmbed, SendMessageWithOptions, CreatePokemonEmbed, CreateVerbosePokemonEmbed } = require('../utilities/messageHelper');
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
                    { name: 'Generation 8/9 (Sword, Shield, Brilliant Diamond, Shining Pearl, Legends: Arceus, Scarlet, Violet)', value: 8 }
                ))
        .addBooleanOption(option =>
            option
                .setName('show-prevolutions')
                .setDescription('Include data pertaining to the prospective Pokémon\'s prevolutions.'))
        .addIntegerOption(option =>
            option
                .setName('verbose')
                .setDescription('Include a detailed breakdown of attainable ribbons by game.')
                .addChoices(
                    { name: 'Textual', value: 1 },
                    { name: 'Graphical', value: 2 }
                )),
    async execute(interaction) {        
        try {
            let nameOption = interaction.options.getString('name');
            let searchResult = SearchByName(nameOption);
            
            let origin = interaction.options.getInteger('origin');

            let prevolutions = interaction.options.getBoolean('show-prevolutions') ?? false;
            let verbose = interaction.options.getInteger('verbose') ?? 0;

            let pokemonData = GetPokemonData(searchResult);

            if (!pokemonData) SendContentAsEmbed(interaction, `'${nameOption}' could not be found...`);
            else {
                if (!verbose) SendMessageWithOptions(interaction, { embeds: [CreatePokemonEmbed(searchResult, pokemonData, origin, prevolutions)] });
                else {
                    let ephemeral = interaction.guildId ? !SPAM_CHANNELS.includes(interaction.channelId) : false;

                    SendMessageWithOptions(interaction, { embeds: [CreateVerbosePokemonEmbed(searchResult, pokemonData, origin, verbose == 2)] }, ephemeral);
                }
            }
        }
        catch (error) {
            ReportError(interaction, error);
        }
    }
}