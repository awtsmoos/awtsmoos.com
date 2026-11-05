// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTargetFrame.js
 * @description Presents a compact mobile target summary with optional bounded details.
 * The Awtsmoos reveals life, defeat, selection, and release by measured truth;
 * Awtsmoos.com keeps enemy identity and health visible without covering quest or rail.
 */

import { isCompactHudViewport } from './MobileHudCompositionRegistry.js';
import {
	bindTargetFrameEvents,
	finiteHudNumber,
	formatTargetReason,
	targetStatus
} from './MobileHudCompositionTargetState.js';
import { renderMobileTargetFrame } from './MobileHudCompositionTargetView.js';

export class MinimalMeadowTargetFrame {
	constructor(host, bus, environment = host.ownerDocument?.defaultView || globalThis) {
		this.host = host;
		this.bus = bus;
		this.environment = environment;
		this.target = null;
		this.status = 'Select a target';
		this.collapsed = isCompactHudViewport(environment);
		this.onClick = event => this.handleClick(event);
		this.host.addEventListener('click', this.onClick);
		this.unsubscribers = bindTargetFrameEvents(this);
		this.render();
	}

	handleClick(event) {
		if (event.target.closest('[data-target-collapse]')) {
			this.toggle();
		}
	}

	show(target) {
		const changed = target?.id && target.id !== this.target?.id;
		this.target = target;
		if (changed) {
			this.collapsed = isCompactHudViewport(this.environment);
		}
		this.host.dataset.visible = 'true';
		this.status = targetStatus(target);
		this.render();
	}

	clear() {
		this.target = null;
		this.status = 'Select a target';
		this.host.dataset.visible = 'false';
		this.render();
	}

	cast(event) {
		if (event.target) {
			this.target = event.target;
		}
		const percent = Math.round((Number(event.progress) || 0) * 100);
		this.message(`Charging ${event.letters || ''} · ${percent}%`);
		this.host.dataset.visible = 'true';
	}

	launch(event) {
		this.message(`${event.letters || 'Action'} launched`, event.target);
	}

	impact(event) {
		this.message(`${event.letters || 'Impact'} · ${finiteHudNumber(event.damage)} damage`, event.target);
	}

	reject(event) {
		this.message(formatTargetReason(event?.reason));
	}

	message(text, target = null) {
		if (target) {
			this.target = target;
		}
		this.status = text;
		this.render();
	}

	toggle() {
		this.collapsed = !this.collapsed;
		this.render();
	}

	render() {
		renderMobileTargetFrame(this.host, {
			collapsed: this.collapsed,
			status: this.status,
			target: this.target
		});
	}

	diagnostics() {
		return {
			collapsed: this.collapsed,
			status: this.status,
			targetId: this.target?.id || null
		};
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
		this.host.removeEventListener('click', this.onClick);
	}
}
