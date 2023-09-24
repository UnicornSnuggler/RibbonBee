const { EmbedBuilder } = require('discord.js');

const { BULBAPEDIA_SUFFIX, BULBAPEDIA_URI, SPRITE_FILE_EXTENSION, SPRITE_URI, AFFIRMATIVE_EMOJI, NEGATIVE_EMOJI, COLORS, FOOTER, FAVICON_URI, WARNING_EMOJI, WARNINGS, PADLOCK_LOCKED_EMOJI, PADLOCK_UNLOCKED_EMOJI } = require('../constants');
const { POKEMON } = require('../data/pokemon');
const { COMMON_FORMS } = require('../data/misc');
const { GetLatestGen, GetGenById, GetGamesByGen } = require('./gameHelper');
const { SuperscriptNumber } = require('./stringHelper');

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
    embed.setTitle(GetNameWithForm(pokemonData));
    embed.setURL(BuildBulbapediaUri(pokemonData.names.eng.replaceAll(' ', '_')));
    embed.setThumbnail(BuildSpriteUri(key));
    embed.setFooter({ text: FOOTER, iconURL: FAVICON_URI });

    let fields = [];
    let warnings = [];

    fields.push(CreatePokemonField(pokemonData, warnings));

    if (pokemonData.evolvesFrom) {
        let prevolutionData = GetPokemonData(pokemonData.evolvesFrom);
        
        while (prevolutionData) {
            fields.push(CreatePokemonField(prevolutionData));
            
            prevolutionData = prevolutionData.evolvesFrom ? GetPokemonData(prevolutionData.evolvesFrom) : null;
        }
    }

    while (fields.length) embed.addFields(fields.pop());

    if (warnings.length) {
        let warningsText = [];

        for (let index = 0; index < warnings.length; index++) {
            // warningsText.push(`${WARNING_EMOJI}${SuperscriptNumber(index + 1)} ${warnings[index]}`);
            warningsText.push(`${WARNING_EMOJI} ${warnings[index]}`);
        }

        embed.addFields({ name: '**Warnings**', value: warningsText.join('\n') });
    }

    return embed;
}

const CreatePokemonField = function(pokemonData, warnings) {
    let description = [];

    let earliestGen = FindEarliestGen(pokemonData);

    description.push(`RM Beginning:\n*Generation ${earliestGen}*`);

    description.push(`\n${pokemonData.flags?.includes('restricted') ? `${PADLOCK_LOCKED_EMOJI} Restricted` : `${PADLOCK_UNLOCKED_EMOJI} Unrestricted`}`);

    let shadows = [];

    if (pokemonData.flags?.includes('colShadow') && pokemonData.games.includes('colosseum')) shadows.push('Col');
    if (pokemonData.flags?.includes('xdShadow') && pokemonData.games.includes('xd')) shadows.push('XD');

    let shadowText = `${shadows.length ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Shadow`;

    if (shadows.length) {
        shadowText += ` *(${shadows.join(', ')})*`;

        if (pokemonData.flags?.includes('overFifty')) {
            warnings.push(`${GetNameWithForm(pokemonData)}${WARNINGS['overFifty']}`);

            // shadowText += ` ${WARNING_EMOJI}${SuperscriptNumber(warnings.length)}`;
            shadowText += ` ${WARNING_EMOJI}`;
        }
    }

    description.push(`${shadowText}\n`);

    description.push(`${pokemonData.games.includes('sh') || pokemonData.games.includes('sw') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Galar`);
    description.push(`${pokemonData.games.includes('bd') || pokemonData.games.includes('sp') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Sinnoh`);
    description.push(`${pokemonData.games.includes('pla') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Hisui`);
    description.push(`${pokemonData.games.includes('scar') || pokemonData.games.includes('vio') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Paldea`);

    description.push('~~     ~~');

    return { name: GetNameWithForm(pokemonData), value: description.join('\n'), inline: true };
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
    
    if (earliestGen == 8 && pokemonData.natdex > 905) earliestGen = 9;

    return earliestGen;
}

const GetNameWithForm = function(pokemonData) {
    let result = '';

    if (pokemonData.forms) result += `${pokemonData.forms.eng.replaceAll(/ form(?!e)/gi, '')} `;

    result += pokemonData.names.eng;

    return result;
}

const GetPokemonData = exports.GetPokemonData = function(name) {
    let key = ConvertNameToKey(name);
    let pokemonData = POKEMON[key];

    if (!pokemonData) return null;

    if (pokemonData['data-source']) {
        let dataSource = POKEMON[pokemonData['data-source']];
        pokemonData = { ...dataSource, ...pokemonData };
    }

    if (pokemonData['form-source']) {
        let formSource = COMMON_FORMS[pokemonData['form-source']];
        pokemonData.forms = formSource;
    }

    return pokemonData;
};

// exports.SearchByName = function(query) {
//     let forms = []; 
    
//     Object.keys(COMMON_FORMS).forEach(key => forms.push(COMMON_FORMS[key].eng.replaceAll(' Form', '')));

    
// }