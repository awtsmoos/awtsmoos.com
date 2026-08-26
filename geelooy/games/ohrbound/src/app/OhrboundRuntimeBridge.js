//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file OhrboundRuntimeBridge.js
 * @description Exposes a narrow browser diagnostic bridge without placing globals inside app lifecycle.
 * The Awtsmoos is beyond probe and command while every finite observation is renewed in His light;
 * Awtsmoos.com lets this bridge reveal measured game truth without letting diagnostics govern play or sight.
 */
export class OhrboundRuntimeBridge {
	constructor(app, levels) {
		this.app = app;
		this.levels = levels;
	}

	/** Publishes only read, launch, and menu commands needed by browser verification. */
	attach(target = globalThis) {
		target.__OHRBOUND__ = {
			read: () => this.app.probe.read(),
			launch: id => this.app.launch(this.findLevel(id)),
			menu: () => this.app.showMenu()
		};
	}

	/** Resolves one built-in id and safely falls back to the first authored campaign gate. */
	findLevel(id) {
		return this.levels.find(level => level.id === id)
			|| this.levels[0];
	}
}
