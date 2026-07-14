//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CityState
 * @description
 * Durable campaign memory and one living chapter meet without becoming tangled.
 * Awtsmoos.com recreates the district from its seed while progress, settings,
 * checkpoints, and earned gifts remain safe beneath the renewing Awtsmoos.
 */
import { CampaignProgress } from '../campaign/CampaignProgress.js';
import { SaveRepository } from '../persistence/SaveRepository.js';
import { LevelGenerator } from '../world/LevelGenerator.js';
import { ChapterSession } from './ChapterSession.js';
import { restoreCheckpoint } from './CheckpointRestore.js';
import { ParticleField } from './ParticleField.js';

export class CityState {
	constructor(seed, repository = new SaveRepository()) {
		this.repository = repository;
		this.generator = new LevelGenerator();
		const saved = repository.load();
		this.progress = new CampaignProgress(saved.progress);
		this.settings = { ...saved.settings };
		this.baseSeed = seed || saved.lastSeed || 'city-of-light';
		this.pendingCheckpoint = saved.lastSeed === this.baseSeed ? saved.checkpoint : null;
		this.paused = false;
		this.chapterTransition = null;
		this.loadChapter(this.progress.currentChapter);
	}
	loadChapter(chapterNumber) {
		this.progress.selectChapter(chapterNumber);
		this.level = this.generator.generate({
			chapterNumber: this.progress.currentChapter,
			seed: this.baseSeed
		});
		this.session = new ChapterSession(this.level, this.progress.unlockedAbilities);
		restoreCheckpoint(this.session, this.pendingCheckpoint, this.progress.currentChapter);
		this.pendingCheckpoint = null;
		this.particles = new ParticleField(this.level.seed, this.level.weather, 88);
		this.chapterTransition = null;
		this.save();
	}
	update(deltaSeconds, direction) {
		if (this.paused || this.chapterTransition) return;
		this.session.update(deltaSeconds, direction);
		this.particles.update(deltaSeconds, this.settings.reducedMotion);
		if (this.session.isComplete()) this.completeChapter();
	}
	completeChapter() {
		const chapter = this.level.chapter;
		const next = this.progress.completeChapter(
			chapter.number,
			chapter.rewardAbility,
			this.session.collectedSparks,
			this.session.elapsedSeconds
		);
		this.chapterTransition = {
			completed: chapter,
			next,
			rewardAbility: chapter.rewardAbility
		};
		this.save();
	}
	continueAfterChapter() {
		if (!this.chapterTransition) return false;
		this.loadChapter(this.progress.currentChapter);
		return true;
	}
	selectChapter(chapterNumber) {
		if (!this.progress.selectChapter(chapterNumber)) return false;
		this.loadChapter(chapterNumber);
		return true;
	}
	restartCheckpoint() {
		this.session.restartAtCheckpoint();
		this.paused = false;
	}
	restartChapter() {
		this.pendingCheckpoint = null;
		this.loadChapter(this.progress.currentChapter);
		this.paused = false;
	}
	newCampaign(seed = this.baseSeed) {
		this.repository.clear();
		this.progress = new CampaignProgress();
		this.baseSeed = seed;
		this.pendingCheckpoint = null;
		this.loadChapter(1);
	}
	toggleSetting(settingName) {
		if (!(settingName in this.settings)) return false;
		this.settings[settingName] = !this.settings[settingName];
		this.save();
		return this.settings[settingName];
	}
	togglePause() {
		this.paused = !this.paused;
		return this.paused;
	}
	save() {
		return this.repository.save({
			progress: this.progress.toJSON(),
			settings: this.settings,
			lastSeed: this.baseSeed,
			checkpoint: this.session?.checkpoint?.toJSON() || null
		});
	}
}
