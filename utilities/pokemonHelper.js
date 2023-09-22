const { EmbedBuilder } = require('discord.js');

const { BULBAPEDIA_SUFFIX, BULBAPEDIA_URI, SPRITE_FILE_EXTENSION, SPRITE_URI, AFFIRMATIVE_EMOJI, NEGATIVE_EMOJI, COLORS, FOOTER, FAVICON_URI } = require('../constants');
const { POKEMON } = require('../data/pokemon');
const { GAMES } = require('../data/misc');
const { GetLatestGen, GetGenById, GetGamesByGen, GetNameById } = require('./gameHelper');

const BuildBulbapediaUri = exports.BuildBulbapediaUri = function(name) {
    return `${BULBAPEDIA_URI}${name}${BULBAPEDIA_SUFFIX}`;
}

const BuildSpriteUri = exports.BuildSpriteUri = function(name) {
    return `${SPRITE_URI}${name}${SPRITE_FILE_EXTENSION}`;
}

const ConvertNameToKey = exports.ConvertNameToKey = function(name) {
    return name.toLowerCase().replaceAll('.', '').replaceAll(' ', '-');
}

exports.CreatePokemonEmbed = function(key, pokemonData) {
    let embed = new EmbedBuilder();
    
    embed.setColor(COLORS.Default);
    embed.setTitle(pokemonData.names.eng);
    embed.setURL(BuildBulbapediaUri(pokemonData.names.eng.replaceAll(' ', '_')));
    embed.setThumbnail(BuildSpriteUri(key));
    embed.setFooter({ text: FOOTER, iconURL: FAVICON_URI });

    let description = [];

    let earliestGen = FindEarliestGen(pokemonData);

    description.push(`**Earliest Generation**: ${earliestGen}`);
    description.push(`**Game(s) of Origin**:`);

    let originGames = FilterGamesListByGen(pokemonData, earliestGen);

    for (var gameId of originGames) {
        description.push(`* ${GetNameById(gameId)}`);
    }

    description.push(`\n**Galar Pokédex**: ${pokemonData.games.includes('sh') || pokemonData.games.includes('sw') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI}`);
    description.push(`**Hisui Pokédex**: ${pokemonData.games.includes('pla') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI}`);
    description.push(`**Paldea Pokédex**: ${pokemonData.games.includes('scar') || pokemonData.games.includes('vio') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI}`);

    // description.push(`\n**Estimated Ribbons**: TBD`);

    embed.setDescription(description.join('\n'));

    return embed;
}

const FilterGamesListByGen = exports.FilterGamesListByGen = function(pokemonData, gen) {
    let gameIds = GetGamesByGen(gen);

    let games = pokemonData.games.filter(x => gameIds.includes(x));

    return games;
}

const FindEarliestGen = exports.FindEarliestGeneration = function(pokemonData) {
    let latestGen = GetLatestGen();
    let earliestGen = latestGen;

    for (let index = 0; index < pokemonData.games.length; index++) {
        let thisGen = GetGenById(pokemonData.games[index]);

        if (thisGen < earliestGen && thisGen > 2) earliestGen = thisGen;
    }

    return earliestGen;
}

exports.GetPokemonData = function(name) {
    let key = ConvertNameToKey(name);

    return POKEMON[key];
};