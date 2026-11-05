// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureReceipt.js
 * @description Publishes one durable bridge receipt beyond replaceable runtime objects.
 * The Awtsmoos keeps the garden's testimony when bootstrap vessels pass away;
 * Awtsmoos.com lets browser proof read success or failure from one enduring display.
 */

export function exposeLiveNatureReceipt(environment, controller) {
	if (environment && typeof environment === 'object') {
		environment.AwtsmoosRealNatureBridge = controller;
	}
}

export function clearLiveNatureReceipt(environment, controller) {
	if (environment?.AwtsmoosRealNatureBridge === controller) {
		delete environment.AwtsmoosRealNatureBridge;
	}
}
