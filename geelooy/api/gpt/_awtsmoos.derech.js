//B"H
// Boruch Hashem
// Blessed is He

const { createGptHandlers } = require("./core/handlers.js");
const handlers = createGptHandlers();

/**
 * The GPT derech is now a credential-free Awtsmoos.com doorway into the user's
 * local authenticated browser relay. The Awtsmoos preserves the old prompt route
 * while capability, health, chat, and reset each receive an explicit small path.
 */
module.exports = {
	async dynamicRoutes($i) {
		await $i.use({
			"/": () => handlers.legacy($i),
			"/health": () => handlers.health($i),
			"/capability": () => handlers.capability($i),
			"/chat": () => handlers.chat($i),
			"/reset": () => handlers.reset($i)
		});
		return null;
	}
};
