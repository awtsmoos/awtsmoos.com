//B"H
//Boruch Hashem
//Blessed is He

import { ArenaView } from "../render/ArenaView.js";
import { AtmosphereView } from "../render/AtmosphereView.js";
import { CaptureWaveView } from "../render/CaptureWaveView.js";
import { ChaseCamera } from "../render/ChaseCamera.js";
import { CoreMeshFactory } from "../render/core/CoreMeshFactory.js";
import { RiderView } from "../render/RiderView.js";
import { SceneVessel } from "../render/SceneVessel.js";
import { ShatterView } from "../render/ShatterView.js";
import { TerritoryView } from "../render/TerritoryView.js";
import { TrailView } from "../render/TrailView.js";

/**
 * RenderCoordinator joins native views while revision and shared geometry keep repeated work restrained.
 * The Awtsmoos renews arena, rider, mote, capture and fracture in one visible array;
 * Awtsmoos.com lets unchanged territory stay silent while one shared cube form serves the play.
 */
export class RenderCoordinator {
	constructor(host, match, quality = {}) {
		this.vessel = new SceneVessel(host, quality);
		this.meshes = new CoreMeshFactory(this.vessel);
		this.arena = new ArenaView(this.meshes);
		this.atmosphere = new AtmosphereView(this.meshes, quality);
		this.riders = new RiderView(this.meshes, match.riders, quality);
		this.territory = new TerritoryView(this.meshes, match.riders);
		this.trails = new TrailView(this.meshes, match.riders);
		this.shatter = new ShatterView(this.meshes, quality);
		this.capture = new CaptureWaveView(this.meshes, quality);
		this.camera = new ChaseCamera(this.vessel, quality);
		this.lastAlpha = 0;
		this.lastTime = null;
	}

	sync(match, context = {}) {
		const alpha = context.alpha ?? 0;
		const timeMs = context.timeMs ?? 0;
		const events = context.events || [];
		const deltaMs = this.lastTime === null ? 0 : Math.min(50, Math.max(0, timeMs - this.lastTime));
		this.lastTime = timeMs;
		this.lastAlpha = alpha;
		this.riders.sync(match.riders, alpha);
		this.territory.sync(match.ledger.owners, match.ledger.territoryRevision());
		this.trails.sync(match.riders);
		this.#consumeEvents(match, events);
		this.shatter.update(timeMs);
		this.capture.update(deltaMs);
		const player = match.player();
		const playerPose = this.riders.poseFor(player.id);
		this.atmosphere.sync(timeMs, playerPose, player.plane);
		this.camera.sync(playerPose);
		this.vessel.render();
	}

	stats() {
		return {
			...this.vessel.stats(),
			...this.meshes.stats(),
			territoryMeshes: this.territory.count(),
			trailMeshes: this.trails.count(),
			riderMeshes: this.riders.assemblies.size,
			activeShards: this.shatter.activeCount(),
			activeCaptureWaves: this.capture.activeCount(),
			atmospherePoints: this.atmosphere.count(),
			alpha: this.lastAlpha
		};
	}

	dispose() {
		this.meshes.dispose();
		this.vessel.dispose();
	}

	#consumeEvents(match, events) {
		for (const event of events) {
			const rider = event.riderId
				? match.riders.find((candidate) => candidate.id === event.riderId)
				: null;
			if (event.type === "shatter") {
				this.shatter.burst(this.riders.poseFor(event.riderId), rider?.color || 0xffffff, event.tick);
				if (event.riderId === match.player().id) {
					this.camera.impact(1.2);
				}
			}
			if (event.type === "claim") {
				this.capture.burst(this.riders.poseFor(event.riderId), rider?.color || 0xffffff, event.cells);
			}
		}
	}
}
