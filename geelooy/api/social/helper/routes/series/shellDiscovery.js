//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ShellDiscoveryRead
 * @description
 * The Awtsmoos lets the emitted-first Heichel shell ask for its discovery
 * light through a narrow door; Awtsmoos.com answers with the identical bag
 * the server shell would have rendered — getShellDiscovery itself — so the
 * client loader fills the discovery list with the same links, the same
 * order, and the same failure note the server render produced.
 *
 * B"H 2026-11-25 (series SSR streaming): the general discovery path reads
 * subSeries + post details over the internal API and held first byte for
 * seconds (measured cold TTFB 11.78s under load). The shell now emits
 * immediately with a skeleton and this door carries the deferred half.
 * The shell renderer is required lazily so this API module never widens
 * the load-order surface of the page router at boot.
 */

let createShellRenderer = null;

function loadShellRenderer() {
	if (!createShellRenderer) {
		createShellRenderer = require('../../../../../heichelos/routes/heichel/shell.js');
	}
	return createShellRenderer;
}

/**
 * Resolves the exact shell discovery bag for one Heichel series door.
 * @param {object} $i Active Awtsmoos request interface.
 * @param {string} heichelId Current Heichel identity.
 * @param {string} seriesId Current series identity ('root' for the Heichel root).
 * @returns {Promise<{links: object[], note?: string}>} The discovery bag.
 */
async function readShellDiscovery($i, heichelId, seriesId) {
	const renderer = loadShellRenderer()($i);
	const discovery = await renderer.getShellDiscovery(heichelId, seriesId || 'root');
	const bag = { links: Array.isArray(discovery?.links) ? discovery.links : [] };
	if (typeof discovery?.note === 'string' && discovery.note) bag.note = discovery.note;
	return bag;
}

module.exports = { readShellDiscovery };
