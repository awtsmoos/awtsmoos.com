//B"H
//Boruch Hashem
//Blessed is He

import { OpenWorldHud } from '../open-world/open-world-hud.js';
import { DailyMissionService } from './daily-mission-service.js';
import { LivingCityInteractionSystem } from './living-city-interaction-system.js';
import { LivingCityStage } from './living-city-stage.js';
import {
	collectLivingCityElements,
	guideFallback,
	LivingCityModeStore,
	publishLivingCityWitness
} from './living-city-service-support.js';

/**
 * @module LivingCityService
 * @description
 * The Awtsmoos renews traveler, visible city, daily purpose, and one interaction composition while every mature domain retains its own law;
 * Awtsmoos.com keeps civic, ecology, Sefirah, encounter, and Realm dispatch behind LivingCityInteractionSystem so this service remains a session/view coordinator.
 * Difficulty, district progress, preserved position, and HUD behavior remain established vessels.
 */
export class LivingCityService {
	constructor(root, options = {}) {
		this.progress = options.progress;
		this.definitions = options.definitions || [];
		this.onInteract = options.onInteract || (() => {});
		this.missions = new DailyMissionService();
		this.elements = collectLivingCityElements(root);
		this.modeStore = new LivingCityModeStore();
		this.interactions = new LivingCityInteractionSystem(this.onInteract);
		this.civic = this.interactions.civic;
		this.positionState = { x: 0, z: 7 };
		this.city = null;
		this.elements.mode.value = this.modeStore.load();
		this.modeHandler = () => this.modeStore.save(this.mode());
		this.elements.mode.addEventListener('change', this.modeHandler);
		this.hud = new OpenWorldHud(this.elements.hud, {
			onDirection: (x, z) => this.city?.setDirection(x, z),
			onInteract: () => this.city?.interact()
		});
		this.hud.mount();
		publishLivingCityWitness(this);
	}

	show(focusId = null) {
		this.refresh();
		if (!this.city) {
			this.city = new LivingCityStage(this.elements.stage, {
				progress: this.progress,
				definitions: this.definitions,
				civic: this.civic.service,
				initialPosition: this.positionState,
				onContext: context => this.handleContext(context),
				onInteract: context => this.interactions.handle(context, this.hud)
			}).mount();
			this.interactions.attach(this.city);
		}
		if (focusId) {
			this.city.focusDistrict(focusId);
		}
		this.elements.guide.textContent = this.city.message();
		publishLivingCityWitness(this);
	}

	suspend() {
		if (!this.city) {
			return;
		}
		this.positionState = this.city.position();
		this.city.destroy();
		this.city = null;
		this.interactions.attach(null);
		this.hud.release();
		this.hud.context(null);
		publishLivingCityWitness(this);
	}

	hide() {
		this.suspend();
	}

	refresh() {
		const city = this.progress.city();
		const mission = this.missions.view(this.progress);
		this.elements.light.textContent = `${city.light} light`;
		this.elements.mission.textContent = mission.label;
		this.elements.missionProgress.textContent = mission.progress;
		this.elements.guide.textContent = this.city?.message() || guideFallback(city);
	}

	mode() {
		return this.elements.mode.value;
	}

	handleContext(context) {
		this.hud.context(context);
		publishLivingCityWitness(this);
	}

	position() {
		return this.city?.position() || { ...this.positionState };
	}

	destroy() {
		this.suspend();
		this.hud.destroy();
		this.elements.mode.removeEventListener('change', this.modeHandler);
	}
}
