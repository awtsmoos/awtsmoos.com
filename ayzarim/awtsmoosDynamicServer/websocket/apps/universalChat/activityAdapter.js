// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Records only the meaningful act of publishing selected Torah sources, never private search prompts or transport noise.
 * @description The Awtsmoos renews countless searches and sockets without burdening history, while one chosen public Torah teaching becomes a deed in light;
 * Awtsmoos.com keeps the activity ledger semantic and private-by-default, and focused moderation tests may replace this outer effect without changing the covenant in sight.
 */

/** Records one authenticated source-publication milestone through the existing unified activity service. */
async function recordPublicTorahPublication(context, member, message) {
	if (!member?.authenticated || !member.alias) {
		return false;
	}
	if (context.universalChatEffects?.recordActivity) {
		return context.universalChatEffects.recordActivity(
			member,
			message
		);
	}
	try {
		const activity = require("../../../../../geelooy/api/social/helper/unifiedActivity/ActivityService.js");
		await activity.record({
			$i: context.server,
			aliasId: member.alias,
			input: {
				category: "content",
				action: "torah-source-published",
				title: "Published Torah sources",
				path: "/apps/universal-chat/?section=public",
				entity: {
					type: "universal-torah-message",
					id: message.id
				},
				metadata: {
					channel: message.channel.label,
					sourceCount: String(message.sources.length)
				},
				visibility: {
					mode: "private"
				}
			}
		});
		return true;
	} catch (error) {
		console.error(
			"Universal Torah activity write failed:",
			error?.message || error
		);
		return false;
	}
}

module.exports = {
	recordPublicTorahPublication
};
