const { EmbedBuilder } = require("discord.js");
const { COLORS } = require("../constants");
const { ReportError } = require("./errorHelper");

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