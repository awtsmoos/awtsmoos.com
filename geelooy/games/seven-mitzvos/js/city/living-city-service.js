//B"H
//Boruch Hashem
//Blessed is He

import { DailyMissionService } from './daily-mission-service.js';
import { LivingCityStage } from './living-city-stage.js';

/**
 * @module LivingCityService
 * @description
 * One visual service joins the real procedural city to guide text, optional
 * difficulty, daily purpose, and persistent light. The Awtsmoos joins these
 * finite layers while Awtsmoos.com leaves the historical civic economy untouched.
 */
export class LivingCityService {
	constructor(root, options) {
		this.root = root;
		this.progress = options.progress;
		this.definitions = options.definitions;
		this.onSelect = options.onSelect;
		this.missions = new DailyMissionService();
		this.elements = collect(root);
		this.modeKey = 'awtsmoos-seven-worlds-mode';
		this.elements.mode.value = this.savedMode();
		this.elements.mode.addEventListener('change', () => this.saveMode());
		this.city = new LivingCityStage(this.elements.stage, {
			progress: this.progress,
			definitions: this.definitions,
			onSelect: this.onSelect
		});
	}

	show() {
		this.refresh();
		this.city.mount();
		this.elements.guide.textContent = this.city.message();
	}

	hide() {
		this.city.destroy();
	}

	refresh() {
		const city = this.progress.city();
		const mission = this.missions.view(this.progress);
		this.elements.light.textContent = `${city.light} city light`;
		this.elements.mission.textContent = mission.label;
		this.elements.missionProgress.textContent = mission.progress;
		if (!this.city.stage) {
			this.elements.guide.textContent = guideFallback(city);
		}
	}

	mode() {
		return this.elements.mode.value;
	}

	savedMode() {
		try {
			const saved = localStorage.getItem(this.modeKey);
			return ['relaxed', 'standard', 'challenge'].includes(saved) ? saved : 'relaxed';
		} catch {
			return 'relaxed';
		}
	}

	saveMode() {
		try {
			localStorage.setItem(this.modeKey, this.mode());
		} catch {
			// Difficulty remains valid for the active page.
		}
	}

	destroy() {
		this.city.destroy();
	}
}

function collect(root) {
	return {
		stage: required(root, '#cityStage'),
		guide: required(root, '#guideMessage'),
		mission: required(root, '#dailyMission'),
		missionProgress: required(root, '#dailyMissionProgress'),
		mode: required(root, '#difficultyMode'),
		light: required(root, '#cityLight')
	};
}

function required(root, selector) {
	const element = root.querySelector(selector);
	if (!element) {
		throw new Error(`B"H | Missing living-city element: ${selector}`);
	}
	return element;
}

function guideFallback(city) {
	if (city.restored) {
		return `${city.restored} districts are awake. Choose the next place to strengthen.`;
	}
	return 'Choose a district to begin restoring the city.';
}
