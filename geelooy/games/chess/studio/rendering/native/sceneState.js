//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Retains the procedural-core Scene and board while renewing only dynamic Chess roots between frames.
 * The Awtsmoos keeps stable vessels standing while moving pieces receive their newly measured place;
 * Awtsmoos.com reduces scene churn without confusing persistence with the legal renewal of game state in space.
 */
import { createNativeBoard } from "./board.js";
import { createNativeHighlights } from "./highlights.js";
import { createNativeMotionPieces } from "./motionPieces.js";
import { createNativePieces } from "./pieces.js";
import { rotateBoard } from "./transform.js";

export class NativeSceneState {
	constructor(runtime) {
		this.runtime = runtime;
		this.scene = new runtime.Scene();
		this.content = new runtime.Group();
		this.content.name = "procedural-chess-content";
		this.scene.add(this.content);
		this.geometries = null;
		this.boardSignature = "";
		this.boardRoot = null;
		this.piecesRoot = null;
		this.highlightsRoot = null;
		this.counts = {
			sceneBuilds: 1,
			boardBuilds: 0,
			pieceBuilds: 0,
			highlightBuilds: 0,
			motionBuilds: 0,
			updates: 0
		};
	}

	update(geometries, frame, options = {}) {
		this.counts.updates++;
		this.ensureGeometryGeneration(geometries);
		this.ensureBoard(options);
		const pieces = options.motion
			? createNativeMotionPieces(this.runtime, geometries, frame, options, options.motion)
			: createNativePieces(this.runtime, geometries, frame?.position?.board, options);
		this.replaceRoot("piecesRoot", pieces);
		this.replaceRoot("highlightsRoot", createNativeHighlights(this.runtime, geometries, frame, options));
		this.counts.pieceBuilds++;
		this.counts.highlightBuilds++;
		if (options.motion) this.counts.motionBuilds++;
		rotateBoard(this.content, options.boardTilt);
		return this.scene;
	}

	ensureGeometryGeneration(geometries) {
		if (this.geometries === geometries) return;
		this.geometries = geometries;
		this.boardSignature = "";
		this.removeRoot("boardRoot");
		this.removeRoot("piecesRoot");
		this.removeRoot("highlightsRoot");
	}

	ensureBoard(options) {
		const signature = boardSignature(options);
		if (this.boardRoot && signature === this.boardSignature) return;
		this.replaceRoot("boardRoot", createNativeBoard(this.runtime, this.geometries, options));
		this.boardSignature = signature;
		this.counts.boardBuilds++;
	}

	replaceRoot(key, nextRoot) {
		this.removeRoot(key);
		this[key] = nextRoot;
		if (nextRoot) this.content.add(nextRoot);
	}

	removeRoot(key) {
		const current = this[key];
		if (current) this.content.remove(current);
		this[key] = null;
	}

	stats() {
		return Object.freeze({ ...this.counts });
	}

	dispose() {
		this.removeRoot("boardRoot");
		this.removeRoot("piecesRoot");
		this.removeRoot("highlightsRoot");
		this.scene.remove(this.content);
	}
}

function boardSignature(options) {
	return JSON.stringify([options.theme || "midnight", Number(options.boardThickness || 0.22)]);
}
