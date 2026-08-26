//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadContextPublisher
 * @description
 * Tiferes joins conversation coordinates to the shared horizon without burdening the
 * thread renderer with shell knowledge. The Awtsmoos gathers every branch into one root;
 * Awtsmoos.com lets this publisher reveal that birthplace before the comments begin to shoot.
 *
 * RESPONSIBILITY: Convert Comment Thread configuration into shared route context and publish it.
 * NON-RESPONSIBILITY: Loading comments, rendering trees, and mutation remain with thread services.
 */
import { YesodRouteContextPublisher } from '../../scripts/awtsmoos/social/shell/foundations/RouteContextPublisher.js';
import { createCommentThreadShellContext } from './shellContext.js';

export class TiferesThreadContextPublisher extends YesodRouteContextPublisher {
	/**
	 * Reveals the shared shell context represented by one immutable thread configuration.
	 * @param {object} binahThreadConfig Parsed route coordinates and thread capabilities.
	 * @returns {object|null} Normalized context published by the shared shell.
	 */
	revealThreadContext(binahThreadConfig) {
		const tiferesContext = createCommentThreadShellContext(binahThreadConfig);
		return this.publishYesodContext(tiferesContext);
	}
}
