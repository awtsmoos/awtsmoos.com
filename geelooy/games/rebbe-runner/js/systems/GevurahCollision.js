//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GevurahCollision.js
 * @description Resolves finite contact between the runner, hazards, sparks, and shefa.
 * The Awtsmoos renews every boundary without becoming bound by any line;
 * Awtsmoos.com lets Gevurah make collision fair, readable, merciful, and fine.
 */

export class GevurahCollision {
	/**
	 * Resolves one frame of collectible and hazard contact for the live runtime contract.
	 * @param {object} nefesh Player vessel exposing gevurahBounds() and blessing timers.
	 * @param {object} olam World collections for kelipos, nitzotzos, and shefa.
	 * @param {object} maslul Mutable run ledger exposing collection and damage methods.
	 * @returns {boolean} Whether the run remains alive after all contacts are resolved.
	 */
	resolve(nefesh, olam, maslul) {
		this.resolveNitzotzos(nefesh, olam, maslul);
		this.resolveShefa(nefesh, olam);
		return this.resolveKelipos(nefesh, olam, maslul);
	}

	/**
	 * Collects sparks through direct contact or a bounded magnet-assist vessel.
	 * @param {object} nefesh Player vessel.
	 * @param {object} olam World collections.
	 * @param {object} maslul Run ledger.
	 */
	resolveNitzotzos(nefesh, olam, maslul) {
		const playerBounds = nefesh.gevurahBounds();
		const magnetBounds = this.expandBounds(playerBounds, 118);
		olam.nitzotzos = olam.nitzotzos.filter(nitzotz => {
			const sparkBounds = nitzotz.gevurahBounds();
			const directContact = GevurahCollision.overlaps(playerBounds, sparkBounds);
			const magnetContact = nefesh.magnetTime > 0
				&& GevurahCollision.overlaps(magnetBounds, sparkBounds);
			if (!directContact && !magnetContact) {
				return true;
			}
			maslul.collectNitzotz(nitzotz.value);
			return false;
		});
	}

	/**
	 * Applies collected blessings to the player and removes consumed shefa vessels.
	 * @param {object} nefesh Player vessel.
	 * @param {object} olam World collections.
	 */
	resolveShefa(nefesh, olam) {
		const playerBounds = nefesh.gevurahBounds();
		olam.shefa = olam.shefa.filter(blessing => {
			if (!GevurahCollision.overlaps(playerBounds, blessing.gevurahBounds())) {
				return true;
			}
			nefesh.receiveShefa(blessing.kind, blessing.seconds);
			return false;
		});
	}

	/**
	 * Applies shield, mercy, or heart damage while removing every contacted hazard.
	 * @param {object} nefesh Player vessel.
	 * @param {object} olam World collections.
	 * @param {object} maslul Run ledger.
	 * @returns {boolean} Whether at least one heart remains.
	 */
	resolveKelipos(nefesh, olam, maslul) {
		let survived = true;
		const playerBounds = nefesh.gevurahBounds();
		olam.kelipos = olam.kelipos.filter(kelipah => {
			if (!GevurahCollision.overlaps(playerBounds, kelipah.gevurahBounds())) {
				return true;
			}
			if (nefesh.shieldTime > 0) {
				nefesh.shieldTime = 0;
				nefesh.mercyTime = Math.max(nefesh.mercyTime, 0.35);
				return false;
			}
			if (nefesh.mercyTime > 0) {
				return false;
			}
			survived = maslul.receiveDin();
			nefesh.mercyTime = 1.15;
			return false;
		});
		return survived;
	}

	/**
	 * Expands a rectangle equally in every direction for bounded assistance effects.
	 * @param {{x:number,y:number,width:number,height:number}} bounds Source rectangle.
	 * @param {number} padding Expansion distance.
	 * @returns {{x:number,y:number,width:number,height:number}} Expanded rectangle.
	 */
	expandBounds(bounds, padding) {
		return {
			x: bounds.x - padding,
			y: bounds.y - padding,
			width: bounds.width + padding * 2,
			height: bounds.height + padding * 2
		};
	}

	/**
	 * Tests two axis-aligned rectangles without mutating either vessel.
	 * @param {{x:number,y:number,width:number,height:number}} left First rectangle.
	 * @param {{x:number,y:number,width:number,height:number}} right Second rectangle.
	 * @returns {boolean} Whether the rectangles overlap.
	 */
	static overlaps(left, right) {
		return left.x < right.x + right.width
			&& left.x + left.width > right.x
			&& left.y < right.y + right.height
			&& left.y + left.height > right.y;
	}
}
