const { EmbedBuilder } = require('discord.js');
const fuzzy = require('./fuzzy');

const { COLORS, FOOTER, FAVICON_URI, RIBBON_IMAGE_URI, RIBBON_IMAGE_FILE_EXTENSION, BULBAPEDIA_RIBBONS_URI, RESTRICTED_RIBBONS } = require('../constants');
const { GetNameById } = require('./gameHelper');
const { ALL_RIBBONS } = require('../data/ribbons');
const { FilterGamesList } = require('./gameHelper');

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

    embed.setDescription(description.join('\n'));

    return embed;
}

exports.GetEligibleRibbons = function(pokemonData, origin) { 
    let ribbons = {
        guaranteed: [],
        possible: [],
        contingent: []
    };
    
    let applicableGames = FilterGamesList(pokemonData, origin);

    for (let key of Object.keys(ALL_RIBBONS)) {
        if (['battle-memory-ribbon-gold', 'contest-memory-ribbon-gold', 'jumbo-mark'].includes(key)) continue;

        let ribbon = ALL_RIBBONS[key];

        if (applicableGames.some(game => ribbon.available?.includes(game))) {
            if (pokemonData.flags?.includes('restricted')) {
                if (RESTRICTED_RIBBONS.includes(key)) continue;
                else if (key == 'tower-master-ribbon' && !pokemonData.games.some(game => ['sw', 'sh'].includes(game))) continue;
                else if (key == 'master-rank-ribbon' && (pokemonData.mythical || !pokemonData.games.some(game => ['sw', 'sh'].includes(game)))) continue;
            }

            if (['battle-memory-ribbon', 'contest-memory-ribbon'].includes(key) && origin >= 5) continue;

            if (key == 'world-ability-ribbon') {
                ribbons.possible.push(ribbon.names.eng);
                continue;
            }
            
            if (pokemonData.flags?.includes('overFifty') && ['national-ribbon', 'winning-ribbon'].includes(key)) {
                ribbons.contingent.push(ribbon.names.eng);
                continue;
            }

            if (pokemonData.flags?.includes('overSeventy') && key == 'footprint-ribbon') {
                ribbons.possible.push(ribbon.names.eng);
                continue;
            }

            if (key == 'national-ribbon') {
                if (!pokemonData.flags?.includes('colShadow') && !pokemonData.flags?.includes('xdShadow')) continue;
            }

            if (key == 'mini-mark') {
                if (pokemonData.flags?.includes('sizeLocked') || !pokemonData.games.some(game => ['scar', 'vio'].includes(game))) continue;
                else {
                    ribbons.possible.push(`${ribbon.names.eng}/${ALL_RIBBONS['jumbo-mark'].names.eng}`);
                    continue;
                }
            }

            ribbons.guaranteed.push(ribbon.names.eng);
        }
    }

    return ribbons;
}

const GetName = function(ribbonData) {
    let result = ribbonData.names.eng;

    return result;
}

exports.GetRibbonData = function(key) {
    let ribbonData = ALL_RIBBONS[key];

    if (!ribbonData) return null;

    return ribbonData;
};

exports.SearchByName = function(query) {
    let matches = [];
    let index = {};
    
    for (let key of Object.keys(ALL_RIBBONS)) {
        let name = ALL_RIBBONS[key].names.eng;

        matches.push(fuzzy(name, query));
        index[name] = key;
        matches.push(fuzzy(key, query));
        index[key] = key;
    }

    matches.sort(fuzzy.matchComparator);

    let result = index[matches[0].term];

    return result;
}