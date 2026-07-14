//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ChapterSession
 * @description
 * One chapter session contains present-tense play: traveler, mission, wildlife,
 * sparks, checkpoint, and earned ability depth. Awtsmoos.com separates this
 * living vessel from durable memory beneath the recreating Awtsmoos.
 */

import { CheckpointState } from './CheckpointState.js';
import { LightPlayer } from './LightPlayer.js';
import { MissionState } from './MissionState.js';
import { activeSanctuaries, currentTargetIds, nearbyTarget } from './SessionTargets.js';
import { WildlifeSystem } from '../wildlife/WildlifeSystem.js';

export class ChapterSession {
	constructor(level, abilities = []) {
		this.level = level;
		this.player = new LightPlayer(level.spawn, abilities);
		this.mission = new MissionState(level.mission);
		this.wildlife = new WildlifeSystem(level.animals);
		this.sparks = level.sparks.map(spark => ({ ...spark, collected: false }));
		this.checkpoint = new CheckpointState(level.spawn, level.chapter.number);
		this.elapsedSeconds = 0;
		this.collectedSparks = 0;
		this.lastEvent = 'The district awakens.';
	}

	update(deltaSeconds, direction) {
		this.elapsedSeconds += deltaSeconds;
		this.player.update(deltaSeconds, direction, this.level.grid);
		this.collectCurrentSparks();
		this.visitCurrentPlatforms();
		this.completeExitWhenTouched();
		const sheltered = this.wildlife.update(
			deltaSeconds,
			this.player,
			this.level.grid,
			activeSanctuaries(this)
		);
		for (const event of sheltered) {
			this.mission.record('escort', event.sanctuaryId, { species: event.species });
			this.lastEvent = `${event.species} reached sanctuary.`;
		}
	}

	collectCurrentSparks() {
		const stage = this.mission.current();
		if (stage?.type !== 'collect') return;
		const targets = currentTargetIds(this);
		for (const spark of this.sparks) {
			if (spark.collected || !targets.has(spark.id) || !this.player.touches(spark)) continue;
			spark.collected = true;
			this.collectedSparks += 1;
			this.mission.record('collect', spark.id);
			this.lastEvent = 'A hidden spark joined the journey.';
		}
	}

	visitCurrentPlatforms() {
		const stage = this.mission.current();
		if (stage?.type !== 'platform') return;
		const targets = currentTargetIds(this);
		for (const platform of this.level.platforms) {
			if (!targets.has(platform.id)) continue;
			if (platform.cells.some(cell => this.player.touches(cell, 0.48))) {
				this.mission.record('platform', platform.id);
				this.lastEvent = 'A raised court remembers your step.';
			}
		}
	}

	completeExitWhenTouched() {
		const stage = this.mission.current();
		if (stage?.type !== 'exit' || !this.player.touches(this.level.exit, 0.52)) return;
		this.mission.record('exit', 'exit');
		this.lastEvent = 'The beacon opens into the next chapter.';
	}

	interact() {
		const stage = this.mission.current();
		if (!stage) return false;
		if (stage.type === 'escort') return this.callAnimals(stage);
		const bridgeSong = this.player.abilities.has('bridgeSong');
		const radius = stage.type === 'bridge' ? (bridgeSong ? 2.6 : 0.9) : 0.8;
		const target = nearbyTarget(this, radius);
		if (!target) return false;
		const changed = this.mission.record(stage.type, target.id);
		if (changed && target.type === 'checkpoint') {
			this.checkpoint.activate(target, this.mission.stageIndex);
		}
		target.active = changed || target.active;
		this.lastEvent = changed ? `${target.type} awakened.` : this.lastEvent;
		return changed;
	}

	callAnimals(stage) {
		const radius = this.player.abilities.has('animalCall') ? 4.8 : 2.2;
		const called = this.wildlife.callNearby(this.player, radius, stage.species);
		this.lastEvent = called ? `${called} ${stage.species} answered.` : 'No creature is close enough.';
		return called > 0;
	}

	restartAtCheckpoint() {
		this.player.reset(this.checkpoint.position());
		this.wildlife.releaseFollowers();
		this.lastEvent = 'The checkpoint restores the traveler.';
	}

	isComplete() {
		return this.mission.isComplete();
	}
}
