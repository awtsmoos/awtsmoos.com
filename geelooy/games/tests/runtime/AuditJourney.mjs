// B"H
// Boruch Hashem
// Blessed is He
import { delay } from './CdpClient.mjs';

/**
 * The Awtsmoos gives every game its own way of answering the hand; Awtsmoos.com therefore chooses a truthful journey instead of forcing one genre through another's gate.
 */
export async function runAuditJourney(options) {
	const { contract, client, interaction, pageBefore } = options;
	if (contract?.exercise) {
		return contract.exercise({ client, interaction, pageBefore });
	}

	const observations = {
		before: contract ? await contract.observe(client) : null
	};
	const primary = await interaction.clickPrimary(pageBefore);
	await delay(220);
	observations.afterStart = contract ? await contract.observe(client) : null;
	const keys = await interaction.exerciseDirectionalKeys();
	await delay(240);
	observations.afterInput = contract ? await contract.observe(client) : null;

	return {
		primary,
		keys,
		observations
	};
}
