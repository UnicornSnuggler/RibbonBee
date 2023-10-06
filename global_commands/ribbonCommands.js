const { SlashCommandBuilder } = require('discord.js');
const { GetRibbonData, ConvertNameToKey, CreateRibbonEmbed, SearchByName } = require('../utilities/ribbonHelper');
const { SendContentAsEmbed, SendMessageWithOptions } = require('../utilities/messageHelper');
const { ReportError } = require('../utilities/errorHelper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ribbon')
        .setDescription('Query for ribbons.')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('The name of the ribbon.')
                .setRequired(true)),
    async execute(interaction) {        
        try {
            let nameOption = interaction.options.getString('name');
            let searchResult = SearchByName(nameOption);

            let ribbonData = GetRibbonData(searchResult);

            if (!ribbonData) SendContentAsEmbed(interaction, `'${nameOption}' could not be found...`);
            else SendMessageWithOptions(interaction, { embeds: [CreateRibbonEmbed(searchResult, ribbonData)] });
        }
        catch (error) {
            ReportError(interaction, error);
        }
    }
}