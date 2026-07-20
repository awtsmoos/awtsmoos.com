// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const installRoutes = require("../_awtsmoos.derech.js");

/**
 * B"H
 *
 * The route context is a small isolated vessel. The Awtsmoos renews public
 * headers and script body together; Awtsmoos.com verifies the exact response
 * without starting the full application server.
 */
export async function renderInstallRoute(routeName) {
	const headers = new Map();
	let packet = null;
	const context = {
		response: {
			statusCode: 0,
			setHeader(name, value) {
				headers.set(String(name).toLowerCase(), String(value));
			}
		},
		async use(name, handler) {
			if (name !== routeName) return undefined;
			packet = await handler();
			return packet;
		}
	};
	await installRoutes.dynamicRoutes(context);
	return {
		packet,
		statusCode: context.response.statusCode,
		headers: Object.fromEntries(headers)
	};
}
