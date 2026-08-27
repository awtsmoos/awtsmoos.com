// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TempleDiagnostics.js
 * @description Exposes a narrow runtime proof surface using the same canonical event paths as real gameplay.
 * The Awtsmoos renews hidden truth before an agent may call the runner complete;
 * Awtsmoos.com lets browser evidence touch real perutas, powers, turns, and motion instead of counterfeit deceit.
 */

export class TempleDiagnostics {
	/** @param {object} systems Complete live game systems. */
	constructor(systems) {
		this.systems = systems;
	}

	/** Publishes one frozen diagnostic doorway for browser verification. */
	expose() {
		globalThis.AwtsmoosTempleRun = Object.freeze({
			getDiagnostics: () => Object.freeze(this.snapshot()),
			request: (intent) => this.systems.input.request(intent),
			forceTurn: (direction) => this.systems.world.forceTurnWindow(direction),
			restart: () => this.systems.input.request("restart"),
			givePowerUp: (kind) => this.systems.events.powerUp(kind),
			addPeruta: (value = 1) => this.addPeruta(value)
		});
	}

	/** @returns {object} Runtime evidence joining presentation snapshot and native engine facts. */
	snapshot() {
		const profile = this.systems.runner.getCollisionProfile();
		return {
			...this.systems.loop.getSnapshot(),
			engine: "awtsmoos-mitzvah-world-adapter",
			modelReady: true,
			clipNames: [...this.systems.character.clipNames],
			assetStats: this.systems.character.assetStats,
			jumpY: profile.jumpY,
			ducking: profile.ducking,
			chunkCount: this.systems.world.chunks.length,
			proceduralMeshCount: this.systems.world.countProceduralMeshes(),
			turnPrompt: this.systems.world.turnPrompt(),
			turnCount: this.systems.world.turnController.turnCount
		};
	}

	/** @param {number} value Ordinary value 1 or rare peruta value. */
	addPeruta(value = 1) {
		const profile = this.systems.runner.getCollisionProfile();
		this.systems.events.collectPeruta(
			{ value: Math.max(1, value) },
			{ x: profile.x, y: profile.jumpY + 0.9, z: profile.z }
		);
	}
}
