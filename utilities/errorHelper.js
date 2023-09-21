const { EmbedBuilder } = require("discord.js");
const { ERROR, COLORS } = require("../constants");

exports.ReportError = function(interaction, error) {
    console.log(error);

    interaction.reply({
        allowedMentions: {
            repliedUser: false
        },
        embeds: [new EmbedBuilder().setColor(COLORS.Default).setDescription(ERROR)],
        ephemeral: false,
        fetchReply: true,
        failIfNotExists: false
    });
}