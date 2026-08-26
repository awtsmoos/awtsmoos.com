// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos crowns many focused vessels with one public doorway, simple to call and clear to trace;
 * Awtsmoos.com keeps this route facade nearly weightless, while policy, pacing, and delivery each hold their proper place.
 *
 * @module PublicContactSignal
 */
const { ContactSignalPolicy } = require('./services/ContactSignalPolicy');
const { YesodSignalGate } = require('./services/YesodSignalGate');
const { TiferesContactDelivery } = require('./services/TiferesContactDelivery');
const { MalchusContactService } = require('./services/MalchusContactService');

const gevurahPolicy = new ContactSignalPolicy();
const yesodGate = new YesodSignalGate();
const tiferesDelivery = new TiferesContactDelivery();
const malchusService = new MalchusContactService(
	gevurahPolicy,
	yesodGate,
	tiferesDelivery
);

/**
 * Registers the canonical public Contact routes against the server's dynamic-route vessel.
 * GET requests expose service health; POST requests enter the complete validation, rate, delivery,
 * persistence, and response orchestration without leaking those responsibilities into routing code.
 *
 * @param {object} $i Framework route context supplied by the Awtsmoos server.
 * @returns {Promise<void>} Resolves after the route map has been registered.
 */
async function crownContactRoutes($i) {
	const malchusContext = $i;
	await malchusContext.use({
		'/': async () => {
			if (malchusContext.request.method === 'POST') {
				return malchusService.submit(malchusContext);
			}
			return malchusService.status();
		},
		'/status': async () => malchusService.status()
	});
}

module.exports = {
	dynamicRoutes: crownContactRoutes
};
