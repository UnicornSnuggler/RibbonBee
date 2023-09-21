const { EmbedBuilder } = require('discord.js');

const { BULBAPEDIA_SUFFIX, BULBAPEDIA_URI, SPRITE_FILE_EXTENSION, SPRITE_URI, AFFIRMATIVE_EMOJI, NEGATIVE_EMOJI, COLORS, FOOTER, FAVICON_URI } = require('../constants');
const { POKEMON } = require('../data/pokemon');

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

    description.push(`**Galar Pokédex**: ${pokemonData.games.includes('sh') || pokemonData.games.includes('sw') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI}`);
    description.push(`**Hisui Pokédex**: ${pokemonData.games.includes('pla') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI}`);
    description.push(`**Paldea Pokédex**: ${pokemonData.games.includes('scar') || pokemonData.games.includes('vio') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI}`);

    // description.push(`\n**Estimated Ribbons**: TBD`);

    embed.setDescription(description.join('\n'));

    return embed;
}

exports.GetPokemonData = function(name) {
    let key = ConvertNameToKey(name);

    return POKEMON[key];
};