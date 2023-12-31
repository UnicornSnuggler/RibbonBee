const { EmbedBuilder } = require("discord.js");

const { AFFIRMATIVE_EMOJI, NEGATIVE_EMOJI, COLORS, FOOTER, FAVICON_URI, WARNING_EMOJI, WARNINGS, PADLOCK_LOCKED_EMOJI, PADLOCK_UNLOCKED_EMOJI, BULBAPEDIA_RIBBONS_URI } = require('../constants');

const { ReportError } = require("./errorHelper");
const { GetGameNameById } = require('./gameHelper');
const { GetNameWithForm, BuildBulbapediaUri, BuildSpriteUri, GetPokemonData, FindEarliestGen } = require("./pokemonHelper");
const { GetEligibleRibbons, BuildRibbonImageUri, GetRibbonName } = require('./ribbonHelper');

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

exports.CreateVerbosePokemonEmbed = function(key, pokemonData, origin, emojis) {
    let embed = new EmbedBuilder();
    
    embed.setColor(COLORS.Default);
    embed.setTitle(GetNameWithForm(pokemonData));
    embed.setURL(BuildBulbapediaUri(pokemonData.names.eng.replaceAll(' ', '_')));
    embed.setThumbnail(BuildSpriteUri(key));
    embed.setFooter({ text: FOOTER, iconURL: FAVICON_URI });

    let eligibleRibbons = GetEligibleRibbons(pokemonData, origin ?? FindEarliestGen(pokemonData), emojis);
    
    let formatting = emojis ? '' : '```';
    let delimiter = emojis ? ' ' : ', ';
    let breaks = emojis ? '\n\n' : '\n';

    let description = `**${eligibleRibbons.guaranteed.length} Guaranteed Ribbon${eligibleRibbons.guaranteed.length > 1 ? 's' : ''}**\n${formatting}${eligibleRibbons.guaranteed.join(delimiter)}${formatting}`;
    if (eligibleRibbons.possible.length) description += `${breaks}**${eligibleRibbons.possible.length} Possible Ribbon${eligibleRibbons.possible.length > 1 ? 's' : ''}**\n${formatting}${eligibleRibbons.possible.join(delimiter)}${formatting}`;
    if (eligibleRibbons.contingent.length) description += `${breaks}**${eligibleRibbons.contingent.length / 2} Contingent Ribbon${eligibleRibbons.contingent.length > 1 ? 's' : ''}**\n${formatting}${eligibleRibbons.contingent.join(delimiter)}${formatting}`;

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

    let eligibleRibbons = GetEligibleRibbons(pokemonData, origin ?? FindEarliestGen(pokemonData));
    
    description.push('\n**Ribbon Totals**');
    description.push(`\`\`\`${eligibleRibbons.guaranteed.length.toString().padStart(3)} Guaranteed`);
    description.push(`${eligibleRibbons.possible.length.toString().padStart(3)} Possible`);
    description.push(`${(eligibleRibbons.contingent.length / 2).toString().padStart(3)} Contingent\`\`\``);

    if (subWarnings.length) warnings.push(subWarnings);

    return { name: GetNameWithForm(pokemonData), value: description.join('\n'), inline: true };
}

exports.CreateRibbonEmbed = function(key, ribbonData) {
    let embed = new EmbedBuilder();
    
    embed.setColor(COLORS.Default);
    embed.setTitle(GetRibbonName(ribbonData));
    embed.setURL(BULBAPEDIA_RIBBONS_URI);
    embed.setThumbnail(BuildRibbonImageUri(key));
    embed.setFooter({ text: FOOTER, iconURL: FAVICON_URI });

    let description = [];

    if (ribbonData.titles) description.push(`*"[Ribbon Master] ${ribbonData.titles.eng}"*\n`);
    if (ribbonData.descs) description.push(`${ribbonData.descs?.eng}\n`);
    if (ribbonData.available) description.push(`**Available Games**:\n${ribbonData.available.map(game => `* ${GetGameNameById(game)}`).join('\n')}`);

    embed.setDescription(description.join('\n'));

    return embed;
}

exports.SendContentAsEmbed = function(interaction, content, ephemeral = false, color = COLORS.Default, title = null) {
    try {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setDescription(content);
    
        if (title != null) embed.setTitle(title);

        return interaction.reply({
            allowedMentions: {
                repliedUser: false
            },
            embeds: [embed],
            ephemeral: ephemeral,
            fetchReply: true,
            failIfNotExists: false
        });
    }
    catch (error) {
        ReportError(interaction, error);
    }
}

exports.SendMessageWithOptions = function(interaction, options, ephemeral = false) {
    try {
        options.allowedMentions = {
            repliedUser: false,
            failIfNotExists: false
        };
        options.ephemeral = ephemeral;
        options.fetchReply = true;

        return interaction.reply(options);
    }
    catch (error) {
        ReportError(interaction, error);
    }
}