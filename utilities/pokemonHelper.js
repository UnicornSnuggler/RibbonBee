const { EmbedBuilder } = require('discord.js');

const { BULBAPEDIA_SUFFIX, BULBAPEDIA_URI, SPRITE_FILE_EXTENSION, SPRITE_URI, AFFIRMATIVE_EMOJI, NEGATIVE_EMOJI, COLORS, FOOTER, FAVICON_URI, WARNING_EMOJI, WARNINGS, PADLOCK_LOCKED_EMOJI, PADLOCK_UNLOCKED_EMOJI } = require('../constants');
const { POKEMON } = require('../data/pokemon');
const { COMMON_FORMS, GAMES } = require('../data/misc');
const { GetLatestGen, GetGenById, GetGamesByGen } = require('./gameHelper');
const { SuperscriptNumber } = require('./stringHelper');
const { GetEligibleRibbons } = require('./ribbonHelper');

const BuildBulbapediaUri = exports.BuildBulbapediaUri = function(name) {
    return `${BULBAPEDIA_URI}${name}${BULBAPEDIA_SUFFIX}`;
}

const BuildSpriteUri = exports.BuildSpriteUri = function(name) {
    return `${SPRITE_URI}${name}${SPRITE_FILE_EXTENSION}`;
}

const ConvertNameToKey = exports.ConvertNameToKey = function(name) {
    return name.toLowerCase().replaceAll('.', '').replaceAll(' ', '-');
}

exports.CreatePokemonEmbed = function(key, pokemonData, origin, prevolutions) {
    let embed = new EmbedBuilder();
    
    embed.setColor(COLORS.Default);
    embed.setTitle(GetNameWithForm(pokemonData));
    embed.setURL(BuildBulbapediaUri(pokemonData.names.eng.replaceAll(' ', '_')));
    embed.setThumbnail(BuildSpriteUri(key));
    embed.setFooter({ text: FOOTER, iconURL: FAVICON_URI });

    let fields = [];
    let warnings = [];

    let field = CreatePokemonField(pokemonData, origin, warnings);

    if (field) fields.push(field);

    if (prevolutions && pokemonData.evolvesFrom) {
        let prevolutionData = GetPokemonData(pokemonData.evolvesFrom);
        
        while (prevolutionData) {
            field = CreatePokemonField(prevolutionData, origin, warnings);

            if (field) fields.push(field);
            
            prevolutionData = prevolutionData.evolvesFrom ? GetPokemonData(prevolutionData.evolvesFrom) : null;
        }
    }

    while (fields.length) embed.addFields(fields.pop());

    let warningsText = [];

    while (warnings.length) {
        let subWarnings = warnings.pop();

        for (let warning of subWarnings) {
            warningsText.push(warning);
        }
    }
    
    if (warningsText.length) embed.addFields({ name: '**Warnings**', value: warningsText.map(warning => `${WARNING_EMOJI} ${warning}`).join('\n') });

    return embed;
}

exports.CreateVerbosePokemonEmbed = function(key, pokemonData, origin) {
    let embed = new EmbedBuilder();
    
    embed.setColor(COLORS.Default);
    embed.setTitle(GetNameWithForm(pokemonData));
    embed.setURL(BuildBulbapediaUri(pokemonData.names.eng.replaceAll(' ', '_')));
    embed.setThumbnail(BuildSpriteUri(key));
    embed.setFooter({ text: FOOTER, iconURL: FAVICON_URI });

    let eligibleRibbons = GetEligibleRibbons(pokemonData, origin);
    let description = '';

    if (eligibleRibbons.guaranteed.length) description += `**Guaranteed Ribbons**\n\`\`\`${eligibleRibbons.guaranteed.join(', ')}\`\`\``;
    if (eligibleRibbons.possible.length) description += `\n**Possible Ribbons**\n\`\`\`${eligibleRibbons.possible.join(', ')}\`\`\``;
    if (eligibleRibbons.contingent.length) description += `\n**Contingent Ribbons**\n\`\`\`${eligibleRibbons.contingent.join(', ')}\`\`\``;

    embed.setDescription(description);

    return embed;
}

const CreatePokemonField = function(pokemonData, origin, warnings) {
    let description = [];
    let subWarnings = [];

    let earliestGen = FindEarliestGen(pokemonData);

    if (origin && origin < earliestGen) {
        warnings.push([`${GetNameWithForm(pokemonData)}${WARNINGS.notCatchable}${origin}`]);
        
        return null;
    }

    if (pokemonData.flags?.includes('overSeventy')) subWarnings.push(`${GetNameWithForm(pokemonData, true)}${WARNINGS.overSeventy}`);

    description.push(`RM Beginning:\n*Generation ${(origin ?? earliestGen) == 8 ? '8/9' : origin ?? earliestGen}*`);

    description.push(`\n${pokemonData.flags?.includes('restricted') ? `${PADLOCK_LOCKED_EMOJI} R` : `${PADLOCK_UNLOCKED_EMOJI} Unr`}estricted`);

    let shadows = [];

    if (pokemonData.flags?.includes('colShadow') && pokemonData.games.includes('colosseum')) shadows.push('Col');
    if (pokemonData.flags?.includes('xdShadow') && pokemonData.games.includes('xd')) shadows.push('XD');

    let shadowText = `${shadows.length ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Shadow`;

    if (shadows.length) {
        shadowText += ` *(${shadows.join(', ')})*`;

        if (pokemonData.flags?.includes('overFifty')) {
            subWarnings.push(`${GetNameWithForm(pokemonData)}${WARNINGS.overFifty}`);

            // shadowText += ` ${WARNING_EMOJI}${SuperscriptNumber(warnings.length)}`;
            shadowText += ` ${WARNING_EMOJI}`;
        }
    }

    description.push(`${shadowText}\n`);

    description.push(`${pokemonData.games.includes('sh') || pokemonData.games.includes('sw') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Galar`);
    description.push(`${pokemonData.games.includes('bd') || pokemonData.games.includes('sp') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Sinnoh`);
    description.push(`${pokemonData.games.includes('pla') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Hisui`);
    description.push(`${pokemonData.games.includes('scar') || pokemonData.games.includes('vio') ? AFFIRMATIVE_EMOJI : NEGATIVE_EMOJI} Paldea`);

    let eligibleRibbons = GetEligibleRibbons(pokemonData, origin);
    
    description.push('\n**Ribbon Totals**');
    description.push(`\`\`\`${eligibleRibbons.guaranteed.length.toString().padStart(3)} Guaranteed`);
    description.push(`${eligibleRibbons.possible.length.toString().padStart(3)} Possible`);
    description.push(`${(eligibleRibbons.contingent.length / 2).toString().padStart(3)} Contingent\`\`\``);

    if (subWarnings.length) warnings.push(subWarnings);

    return { name: GetNameWithForm(pokemonData), value: description.join('\n'), inline: true };
}

const FindEarliestGen = function(pokemonData) {
    let latestGen = GetLatestGen();
    let earliestGen = latestGen;
    
    for (let index = 0; index < pokemonData.games.length; index++) {
        let thisGen = GetGenById(pokemonData.games[index]);
        
        if (thisGen < earliestGen && thisGen > 2) earliestGen = thisGen;
    }
    
    // if (earliestGen == 8 && pokemonData.natdex > 905) earliestGen = 9;

    return earliestGen;
}

const GetNameWithForm = function(pokemonData, foregoForm = false) {
    let result = '';

    if (pokemonData.forms && !foregoForm) result += `${pokemonData.forms.eng.replaceAll(/ form(?!e)/gi, '')} `;

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