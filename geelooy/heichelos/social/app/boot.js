// B"H
import { createSocialApi } from '../api/index.js';
import { TiferesSocialRevampController } from './TiferesSocialRevampController.js';
export { loadSocialHome } from './BinahSocialHomeLoader.js';

/**
 * @module SocialRevampBoot
 * @description
 * The boot gateway performs dependency assembly only. Tiferes owns lifecycle,
 * Yesod owns transport and persistence, and Binah owns normalization so this
 * entrypoint remains stable even as the social system expands dramatically.
 */
export function bootSocialRevamp(malchusTarget = document.body, malchusData = {}, options = {}) {
	const malchusDocument = malchusTarget.ownerDocument || document;
	const tiferesApi = options.api || createSocialApi({
		fetcher: options.fetcher || globalThis.fetch?.bind(globalThis)
	});
	const tiferesController = new TiferesSocialRevampController({
		target: malchusTarget,
		document: malchusDocument,
		api: tiferesApi,
		data: malchusData,
		loader: options.loader,
		draftReader: options.draftReader,
		persistence: options.persistence
	});
	return tiferesController.start();
}
