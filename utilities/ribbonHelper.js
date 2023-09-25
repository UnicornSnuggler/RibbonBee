const { EmbedBuilder } = require('discord.js');

const { COLORS, FOOTER, FAVICON_URI, RIBBON_IMAGE_URI, RIBBON_IMAGE_FILE_EXTENSION, BULBAPEDIA_RIBBONS_URI } = require('../constants');
const { GetNameById } = require('./gameHelper');
const { ALL_RIBBONS } = require('../data/ribbons');

const BuildRibbonImageUri = exports.BuildRibbonImageUri = function(name) {
    return `${RIBBON_IMAGE_URI}${name}${RIBBON_IMAGE_FILE_EXTENSION}`;
}

const ConvertNameToKey = exports.ConvertNameToKey = function(name) {
    return name.toLowerCase().replaceAll('.', '').replaceAll(' ', '-');
}

exports.CreateRibbonEmbed = function(key, ribbonData) {
    let embed = new EmbedBuilder();
    
    embed.setColor(COLORS.Default);
    embed.setTitle(GetName(ribbonData));
    embed.setURL(BULBAPEDIA_RIBBONS_URI);
    embed.setThumbnail(BuildRibbonImageUri(key));
    embed.setFooter({ text: FOOTER, iconURL: FAVICON_URI });

    let description = [];

    if (ribbonData.titles) description.push(`*"[Ribbon Master] ${ribbonData.titles.eng}"*\n`);
    if (ribbonData.descs) description.push(`${ribbonData.descs?.eng}\n`);
    if (ribbonData.available) description.push(`**Available Games**:\n${ribbonData.available.map(game => `* ${GetNameById(game)}`).join('\n')}`);

    description.push('~~     ~~');

    embed.setDescription(description.join('\n'));

    return embed;
}

const GetName = function(ribbonData) {
    let result = ribbonData.names.eng;

    return result;
}

exports.GetRibbonData = function(name) {
    let key = ConvertNameToKey(name);
    let ribbonData = ALL_RIBBONS[key];

    if (!ribbonData) return null;

    return ribbonData;
};