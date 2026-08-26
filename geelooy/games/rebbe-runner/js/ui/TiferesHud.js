//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesHud.js
 * @description Manifests score, mission, powers, overlays, and accessible announcements.
 * The Awtsmoos renews harmony before information can become cluttered weight; Awtsmoos.com lets Tiferes reveal what matters now, while deeper detail waits behind a graceful gate.
 */

export class TiferesHud {
	/** @param {HTMLElement} root Route-owned game root. */
	constructor(root) {
		this.root = root;
		this.score = root.querySelector('[data-runner-score]');
		this.stage = root.querySelector('[data-runner-stage]');
		this.combo = root.querySelector('[data-runner-combo]');
		this.best = root.querySelector('[data-runner-best]');
		this.mission = root.querySelector('[data-runner-mission]');
		this.missionMeter = root.querySelector('[data-runner-mission-meter]');
		this.powers = root.querySelector('[data-runner-powers]');
		this.overlay = root.querySelector('[data-runner-overlay]');
		this.overlayTitle = root.querySelector('[data-runner-overlay-title]');
		this.overlayBody = root.querySelector('[data-runner-overlay-body]');
		this.overlayAction = root.querySelector('[data-runner-overlay-action]');
		this.announcer = root.querySelector('[data-runner-live]');
	}

	/** Synchronizes compact HUD values without recreating the surrounding DOM tree. */
	update(snapshot, mission, bestScore) {
		this.score.textContent = snapshot.score.toLocaleString();
		this.stage.textContent = String(snapshot.stage);
		this.combo.textContent = `${snapshot.combo}×`;
		this.best.textContent = Math.floor(bestScore).toLocaleString();
		this.updateMission(mission);
		this.powers.textContent = this.powerLabel(snapshot);
		this.root.dataset.runnerPhase = snapshot.phase;
	}

	/** Renders the current optional mission with text and native progress semantics. */
	updateMission(mission) {
		const rounded = Math.floor(mission.current);
		this.mission.textContent = `${mission.label} · ${rounded}/${mission.target} ${mission.unit}`;
		this.missionMeter.max = mission.target;
		this.missionMeter.value = Math.min(mission.target, mission.current);
	}

	/** Produces a textual power-state label that never relies on color alone. */
	powerLabel(snapshot) {
		const active = [];
		if (snapshot.shielded) {
			active.push('Shield');
		}
		if (snapshot.inspired) {
			active.push('Inspiration');
		}
		if (active.length) {
			return active.join(' · ');
		}
		return 'Steady path';
	}

	/** Opens the contained overlay and assigns one explicit game-owned action. */
	showOverlay(title, body, action, label) {
		this.overlayTitle.textContent = title;
		this.overlayBody.textContent = body;
		this.overlayAction.textContent = label;
		this.overlayAction.setAttribute('data-runner-action', action);
		this.overlay.hidden = false;
		requestAnimationFrame(() => {
			this.overlayAction.focus({ preventScroll: true });
		});
	}

	/** Removes the overlay from pointer and visual flow while play is running. */
	hideOverlay() {
		this.overlay.hidden = true;
	}

	/** Announces meaningful transitions without constant score chatter. */
	announce(message) {
		this.announcer.textContent = '';
		requestAnimationFrame(() => {
			this.announcer.textContent = message;
		});
	}
}
