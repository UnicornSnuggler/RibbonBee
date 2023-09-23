const { EmbedBuilder } = require('discord.js');

const { BULBAPEDIA_SUFFIX, BULBAPEDIA_URI, SPRITE_FILE_EXTENSION, SPRITE_URI, AFFIRMATIVE_EMOJI, NEGATIVE_EMOJI, COLORS, FOOTER, FAVICON_URI, WARNING_EMOJI } = require('../constants');
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

    let fields = [];

    fields.push(CreatePokemonField(pokemonData));

    if ('evolvesFrom' in pokemonData) {
        let prevolutionData = GetPokemonData(pokemonData.evolvesFrom);
        
        while (prevolutionData) {
            fields.push(CreatePokemonField(prevolutionData));
            
            prevolutionData = 'evolvesFrom' in prevolutionData ? GetPokemonData(prevolutionData.evolvesFrom) : null;
        }
    }

    while (fields.length) embed.addFields(fields.pop());

    return embed;
}

const CreatePokemonField = function(pokemonData) {
    let description = [];

    let earliestGen = FindEarliestGen(pokemonData);

    description.push(`Generation ${earliestGen}`);

    let shadows = [];

    if (pokemonData.flags?.includes('colShadow')) shadows.push('Col');
    if (pokemonData.flags?.includes('xdShadow')) shadows.push('XD');

    description.push(`\n${shadows.length ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Shadow${shadows.length ? ` *(${shadows.join(', ')})*` : ''}`);

    description.push(`\n${pokemonData.games.includes('sh') || pokemonData.games.includes('sw') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Galar`);
    description.push(`${pokemonData.games.includes('pla') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Hisui`);
    description.push(`${pokemonData.games.includes('scar') || pokemonData.games.includes('vio') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Paldea`);

    let warnings = [];

    if (pokemonData.flags?.includes('restricted')) warnings.push('Restricted');
    if (pokemonData.flags?.includes('overFifty')) warnings.push('Over level 50');

    if (warnings.length) {
        description.push(`\n**Warnings**`);
        
        for (let warning of warnings) description.push(`${WARNING_EMOJI} ${warning}`);
    }

    return { name: pokemonData.names.eng, value: description.join('\n'), inline: true };
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

const GetPokemonData = exports.GetPokemonData = function(name) {
    let key = ConvertNameToKey(name);

    return POKEMON[key];
};