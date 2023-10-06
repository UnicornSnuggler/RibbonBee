const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SendMessageWithOptions } = require('../utilities/messageHelper');
const { ReportError } = require('../utilities/errorHelper');
const { CREDITS, COLORS, FOOTER, FAVICON_URI, POKEMON_OUTPUT_IMAGE, AFFIRMATIVE_EMOJI, NEGATIVE_EMOJI, RIBBON_OUTPUT_IMAGE, SPAM_CHANNELS } = require('../constants');
const { BuildSpriteUri } = require('../utilities/pokemonHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Retrieve helpful information regarding how best to utilize my functionality!')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('The specific command with which you would like assistance.')
                .setRequired(false)
                .addChoices(
                    { name: 'pokemon', value: 'pokemon' },
                    { name: 'ribbon', value: 'ribbon' }
                )),
    async execute(interaction) {        
        try {
            let commandOption = interaction.options.getString('command');

            let ephemeral = interaction.guildId ? !SPAM_CHANNELS.includes(interaction.channelId) : false;

            let embed = new EmbedBuilder();
    
            embed.setColor(COLORS.Default);
            embed.setTitle(`${commandOption ? `/${commandOption}` : 'RibbonBee'} Help`);
            embed.setFooter({ text: FOOTER, iconURL: FAVICON_URI });

            let description = [];

            if (!commandOption) {
                embed.setThumbnail(BuildSpriteUri('ribombee'));

                description.push(`## What is this?`);
                description.push(`RibbonBee is a querying utility that allows Ribbon Masters of all experience levels to easily retrieve information pertaining to a particular species of Pokémon or individual ribbons. It can be used as a quick reference for discussion's sake, a tool for planning out prospective Ribbon Masters, or as a roundabout sort of checklist for keeping track of which ribbons your Ribbon Master has still yet to earn.`);
                description.push(`## How do I use it?`);
                description.push(`Much like many other Discord bots, RibbonBee utilizes "slash commands," which are special functions you can activate by typing the command into the message box in any channel that RibbonBee can see. This includes direct messages to RibbonBee!\n\nThere are two commands you can use: \`/pokemon\` and \`/ribbon\`. Each command requires a \`name\` parameter that will be used to query the entity in question. These slash commands might also have additional *optional* parameters you can utilize for additional functionality. For more information on a specific command, use the optional \`command\` parameter on this help function!`);
                description.push(`## Who helped make it?`);
                description.push(`* Designed, created, and programmed by <@${CREDITS.unicorn}>.\n* Inspiration and data provided by <@${CREDITS.sly}> *(creator of [ribbons.guide](https://ribbons.guide/))*.\n* Additional data entry performed by <@${CREDITS.mercuryEnigma}> and <@${CREDITS.corn}>.\n* Beta testing and feedback provided by <@${CREDITS.sirToastyToes}>, <@${CREDITS.ribombunny}>, <@${CREDITS.psychicJ}>, <@${CREDITS.sadisticMystic}>, <@${CREDITS.regiultima}>, and <@${CREDITS.kestrel}>.\n* Administrative overhead and commission outreach thanks to <@${CREDITS.venty}>.\n* Profile picture created by <@${CREDITS.exekyl}>. *(More of their art can be found [here](https://twitter.com/exekylart?s=21&t=KCm8dwx1TSAxdFsNzCs86Q).)*`);
                description.push(`## How can I support it?`);
                description.push(`If you would like to make a donation to encourage longevity and further improvements of RibbonBee — or you would simply like to express your gratitude — you can [buy its creator a coffee](https://www.buymeacoffee.com/unicornsnuggler) or subscribe to their [Patreon](https://www.patreon.com/UnicornSnuggler).`);
            }
            else if (commandOption == 'pokemon') {
                embed.setThumbnail(POKEMON_OUTPUT_IMAGE);
                
                description.push(`## Output Breakdown`);
                description.push(`1. The name of the specified Pokémon.`);
                description.push(`2. The sprite image of the specified Pokémon.`); 
                description.push(`3. The earliest generation of games in which the specified Pokémon is catchable. *(If the \`origin\` parameter is being used, this will represent the generation specified.)*`);
                description.push(`4. "Restricted" and "Unrestricted" represent the specified Pokémon's eligibility for participation in Master-level battle facilities and ranked PVP matches. "Shadow" represents the specified Pokémon's status as a shadow Pokémon in both of the generation 3 GameCube games.`);
                description.push(`5. "Galar", "Sinnoh", "Hisui", and "Paldea" represent the specified Pokémon's presence in all four of the generation 8/9 Switch games. A ${AFFIRMATIVE_EMOJI} indicates that the specified Pokémon is present in that game and can collect its ribbons. A ${NEGATIVE_EMOJI} indicates that the specified Pokémon is **not** present in that game and cannot collect its ribbons.`);
                description.push(`6. The "Ribbon Totals" section outlines a close approximation of the number of ribbons that the specified Pokémon is able to acquire throughout its Ribbon Mastery journey starting from the indicated generation.`);
                description.push(` * \`Guaranteed\` represents ribbons that the specified Pokémon will always be able to obtain under the given circumstances.`);
                description.push(` * \`Possible\` represents ribbons that may or may not be obtainable for the specified Pokémon based on their individual origins *(i.e. an event Pokémon distributed at one level versus a catchable Pokémon at a different level)*, the present climate of the competitive regulations *(i.e. certain restricted Pokémon being allowed in PVP matches)*, or your willingness to go above and beyond what is strictly viable within the confines of a given game *(i.e. reconfiguring your DNS settings to connect to unofficial servers for online connectivity)*.`);
                description.push(` * \`Contingent\` represents conflicting ribbons that the specified Pokémon cannot simultaneously earn, necessitating a choice to be made between the set.`);
                description.push(`7. The "Warnings" section will only appear if the specified Pokémon possesses any notable information to keep track of during its Ribbon Mastery journey.`);
                description.push(`## Additional Parameters`);
                description.push(`The \`/pokemon\` command accepts three optional parameters:`);
                description.push(`* \`origin\` — Used to specify a different starting generation than the specified Pokémon's earliest appearance. *(Note that this will return an error if the specified Pokémon is not present in any of the selected generation's games.)*`);
                description.push(`* \`show-prevolutions\` — Used to retrieve information for each of the specified Pokémon's prevolutions simultaneously. If the specified Pokémon possesses any prevolutions, their data will be shown in sequential order.`);
                description.push(`* \`verbose\` — Used to retrieve a raw list of ribbon names that the specified Pokémon is able to acquire based on the queried parameters. *(**Note**: In an effort to avoid flooding channels with walls of text, if this flag is used outside of direct messages or designated RibbonBee channels, only you will be able to see its output.)*`);
            }
            else if (commandOption == 'ribbon') {
                embed.setThumbnail(RIBBON_OUTPUT_IMAGE);

                description.push(`## Output Breakdown`);
                description.push(`1. The name of the specified ribbon.`);
                description.push(`2. The sprite image of the specified ribbon.`);
                description.push(`3. The title associated with the specified ribbon. This is the text that will appear after your Pokémon's nickname when they are sent out during battle.`);
                description.push(`4. The description of the specified ribbon.`);
                description.push(`5. A list of all of the games in which the specified ribbon is present.`);
            }

            embed.setDescription(description.join('\n'));

            SendMessageWithOptions(interaction, { embeds: [embed] }, ephemeral);
        }
        catch (error) {
            ReportError(interaction, error);
        }
    }
}