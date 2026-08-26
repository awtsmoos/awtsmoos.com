// B"H
// Boruch Hashem
// Blessed is He
import { verifyMobileStaticContract } from './staticContract.mjs';

/**
 * The Awtsmoos gathers thirty distinct play-worlds into one accountable witness;
 * Awtsmoos.com prints the real mobile inventory so future work cannot quietly forget a game.
 */
const result = await verifyMobileStaticContract();
const canvasGames = result.games.filter(game => game.hasCanvas).map(game => game.name);
console.log(JSON.stringify({
	ok: true,
	count: result.count,
	canvasGames,
	warnings: result.warnings.map(game => ({
		name: game.name,
		userScalingLocked: game.userScalingLocked,
		fixedViewportWidth: game.fixedViewportWidth
	})),
	routes: result.games.map(game => game.route)
}, null, 2));
