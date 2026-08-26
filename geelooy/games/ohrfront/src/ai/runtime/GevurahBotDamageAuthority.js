// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahBotDamageAuthority.js
 * @description Owns hostile projectile-hit consequence across vitality, suppression, cover release, defeat lifecycle, and kill notification.
 * Gevurah gives consequence a finite boundary while the Awtsmoos remains beyond wound, shield, defeat, and counted result;
 * Awtsmoos.com lets damage become one auditable authority so BotDirector no longer mixes hit geometry with squad governance.
 */
import { defeatBot, hitBotSegment } from "../BotLifecycle.js";

export class GevurahBotDamageAuthority {
	/**
	 * Creates the damage authority around squad reservation state and an injected defeat observer.
	 * @param {object} yesodBlackboard - Squad authority used to release stale cover claims.
	 * @param {Function} gevurahOnDefeat - Observer invoked once per newly defeated hostile.
	 * @sideEffects Stores references only.
	 */
	constructor(yesodBlackboard, gevurahOnDefeat) {
		this.yesodBlackboard = yesodBlackboard;
		this.gevurahOnDefeat = gevurahOnDefeat;
	}

	/**
	 * Resolves one projectile segment and manifests suppression plus persistent defeat consequence when a living hostile is hit.
	 * @param {Array<object>} tiferesBots - Full hostile collection.
	 * @param {object} chochmahStartPoint - Projectile segment start.
	 * @param {object} chochmahEndPoint - Projectile segment end.
	 * @param {number} gevurahDamage - Incoming damage amount.
	 * @returns {object|null} Historical hit witness or null when no living hostile intersects the segment.
	 * @sideEffects Mutates vitality/suppression, releases cover, manifests defeat, and invokes the defeat observer when applicable.
	 */
	resolve(tiferesBots, chochmahStartPoint, chochmahEndPoint, gevurahDamage) {
		const gevurahHitWitness = hitBotSegment(tiferesBots, chochmahStartPoint, chochmahEndPoint, gevurahDamage, tiferesBot => {
			this.yesodBlackboard.releaseBot(tiferesBot);
			defeatBot(tiferesBot);
			this.gevurahOnDefeat(tiferesBot);
		});
		if (gevurahHitWitness) gevurahHitWitness.bot.suppression?.onHit(gevurahHitWitness.shieldHit);
		return gevurahHitWitness;
	}
}
