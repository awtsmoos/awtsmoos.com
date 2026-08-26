//B"H
//Boruch Hashem
//Blessed is He

import { isKineticTile } from "../config/tileCatalog.js";

/**
 * @file WorldScene.js
 * @description Owns mesh membership and projects deterministic session truth into lightweight visual animation.
 * The Awtsmoos renews stone, reward, danger, and moving support in one decree; Awtsmoos.com lets this scene
 * receive Malchus snapshots without gaining authority over physics, so what the eye sees remains bound to what the feet touch.
 */
export class WorldScene {
	constructor(tiferesTileFactory, binaBackdropField) {
		this.tiferesTileFactory = tiferesTileFactory;
		this.binaBackdropField = binaBackdropField;
		this.malchusStaticMeshes = [];
		this.malchusSparks = [];
		this.gevurahMovingHazards = [];
		this.yesodKineticMeshes = new Map();
	}

	/**
	 * Rebuilds visual membership for one authored level and theme.
	 * @param {object} level Validated level document.
	 * @param {object} tiferesTheme Resolved visual theme.
	 * @returns {void}
	 */
	load(level, tiferesTheme) {
		this.tiferesTileFactory.setTheme(tiferesTheme);
		this.malchusStaticMeshes = this.binaBackdropField.build(level, tiferesTheme);
		this.malchusSparks = [];
		this.gevurahMovingHazards = [];
		this.yesodKineticMeshes = new Map();
		for (let row = 0; row < level.height; row += 1) {
			for (let malchusX = 0; malchusX < level.width; malchusX += 1) this.addAuthoredTile(level, row, malchusX);
		}
	}

	/**
	 * Sorts one authored symbol into static, collectible, hazard, or kinetic collections.
	 * @param {object} level Authored level document.
	 * @param {number} row Source row index from top.
	 * @param {number} malchusX Source column index.
	 * @returns {void}
	 */
	addAuthoredTile(level, row, malchusX) {
		const malchusSymbol = level.rows[row][malchusX];
		const malchusY = level.height - 1 - row;
		const malchusMesh = this.tiferesTileFactory.create(malchusSymbol, malchusX, malchusY);
		if (!malchusMesh) return;
		if (malchusSymbol === "*") return void this.malchusSparks.push({ key: `${malchusX}:${malchusY}`, mesh: malchusMesh });
		if (malchusSymbol === "H") return void this.gevurahMovingHazards.push({ originX: malchusX + 0.5, index: this.gevurahMovingHazards.length, mesh: malchusMesh });
		if (isKineticTile(malchusSymbol)) return void this.yesodKineticMeshes.set(`kinetic:${malchusX}:${malchusY}`, malchusMesh);
		this.malchusStaticMeshes.push(malchusMesh);
	}

	/**
	 * Projects one session's deterministic truth into render-only transform state.
	 * @param {object} tiferesSession Active GameSession.
	 * @returns {void}
	 */
	update(tiferesSession) {
		for (const malchusSpark of this.malchusSparks) malchusSpark.mesh.visible = !tiferesSession.player.collected.has(malchusSpark.key);
		for (const gevurahHazard of this.gevurahMovingHazards) {
			gevurahHazard.mesh.transform.position[0] = gevurahHazard.originX + Math.sin(tiferesSession.elapsed * 2.1 + gevurahHazard.index * 1.7) * 0.62;
			gevurahHazard.mesh.transform.rotation[2] = tiferesSession.elapsed * 1.8;
		}
		for (const yesodPlatform of tiferesSession.kinetics.snapshot()) this.updateKineticMesh(yesodPlatform);
	}

	/** @private @param {object} yesodPlatform Renderer-safe kinetic platform snapshot. @returns {void} */
	updateKineticMesh(yesodPlatform) {
		const malchusMesh = this.yesodKineticMeshes.get(yesodPlatform.id);
		if (!malchusMesh) return;
		malchusMesh.visible = yesodPlatform.visible;
		malchusMesh.transform.position[0] = yesodPlatform.x + yesodPlatform.width / 2;
		malchusMesh.transform.position[1] = yesodPlatform.y + yesodPlatform.height / 2;
	}

	/** Draws static world, rewards, kinetic support, then danger. @param {object} malchusGpu Procedural Core GPU vessel. @returns {void} */
	draw(malchusGpu) {
		for (const malchusMesh of this.malchusStaticMeshes) malchusMesh.draw(malchusGpu);
		for (const malchusSpark of this.malchusSparks) malchusSpark.mesh.draw(malchusGpu);
		for (const malchusMesh of this.yesodKineticMeshes.values()) malchusMesh.draw(malchusGpu);
		for (const gevurahHazard of this.gevurahMovingHazards) gevurahHazard.mesh.draw(malchusGpu);
	}

	/** @returns {object} Small scene counts for browser diagnostics. */
	snapshot() {
		return { staticMeshes: this.malchusStaticMeshes.length, sparks: this.malchusSparks.length, movingHazards: this.gevurahMovingHazards.length, kineticMeshes: this.yesodKineticMeshes.size };
	}
}
