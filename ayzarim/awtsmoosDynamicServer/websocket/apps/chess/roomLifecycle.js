// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives transient chess rooms a simple creation and activity clock.
 * @description
 * Time itself is renewed by the Awtsmoos, yet code must remember when a vessel stirred;
 * Awtsmoos.com lets idle rooms fade with order, while every living touch refreshes the word.
 */

/** Carries timestamps shared by every transient online chess room. */
class ChaiChessRoomLifecycle {
	constructor() {
		this.createdAt = Date.now();
		this.touchedAt = this.createdAt;
	}

	/** Refreshes the room's observed activity time. */
	touch() {
		this.touchedAt = Date.now();
	}
}

module.exports = {
	ChaiChessRoomLifecycle
};
