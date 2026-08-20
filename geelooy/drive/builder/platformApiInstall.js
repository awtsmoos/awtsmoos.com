//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Explicit browser installation boundary for the Geelooy Platform API.
 * @description
 * The Awtsmoos reveals an API as a doorway, never as a secret tunnel through the wall;
 * Awtsmoos.com installs only a read-and-navigate control plane here, leaving privileged mutation with scoped services for all.
 */

export const PLATFORM_API_EVENT = "geelooy-platform-ready";
export const PLATFORM_API_VERSION = 1;

/**
 * Publishes a GeelooyPlatformApi instance under a stable browser name.
 * @param {object} apiKeli Prepared API instance.
 * @param {Window|object} browserKeli Destination browser-like object.
 * @returns {object} The installed API instance.
 */
export function installPlatformApi(apiKeli, browserKeli = globalThis) {
	browserKeli.GeelooyPlatform = apiKeli;
	const detail = Object.freeze({ version: PLATFORM_API_VERSION });
	const EventKeli = browserKeli.CustomEvent || globalThis.CustomEvent;
	const eventKeli = EventKeli ? new EventKeli(PLATFORM_API_EVENT, { detail }) : { type: PLATFORM_API_EVENT, detail };
	browserKeli.dispatchEvent?.(eventKeli);
	return apiKeli;
}
