//B"H
//Boruch Hashem
//Blessed is He

import { realmActions } from './realm-actions.js';
import { RealmAccountView } from './realm-account-view.js';
import { realmTemplate } from './realm-template.js';

/**
 * @module RealmView
 * @description
 * The realm projects actionable civic truth and an optional enduring account while
 * preserving one visible world. The Awtsmoos is beyond interface; Awtsmoos.com
 * keeps rendering bounded, accessible, and separate from domain mutation.
 */
export class RealmView {
	constructor(layer) {
		this.layer = layer;
	}

	mount(callbacks) {
		this.layer.innerHTML = realmTemplate();
		this.callbacks = callbacks;
		this.elements = Object.fromEntries([
			'Clock', 'Role', 'Trust', 'Event', 'Bridge', 'Home',
			'Inventory', 'Skills', 'Message', 'Actions', 'Chronicle', 'Performance'
		].map(name => [name.toLowerCase(), this.layer.querySelector(`#realm${name}`)]));
		this.layer.querySelector('#realmBack').addEventListener('click', callbacks.exit);
		this.account = new RealmAccountView(this.layer);
		this.account.mount({ action: callbacks.action });
		this.bindMovement(callbacks.move);
	}

	render(state, context, performance) {
		this.elements.clock.textContent = clockText(state.clock.minute);
		this.elements.role.textContent = strongestRole(state);
		this.elements.trust.textContent = `Trust ${state.settlement.trust}`;
		this.elements.event.innerHTML = eventMarkup(state.event);
		this.elements.bridge.textContent = state.bridge.complete
			? 'Restored · caravans active'
			: `${state.bridge.timber}/${state.bridge.timberRequired} timber · ${state.bridge.stone}/${state.bridge.stoneRequired} stone`;
		this.elements.home.textContent = `Workshop ${state.home.workshop}/3 · condition ${state.home.condition}`;
		this.elements.inventory.textContent = inventoryText(state.player.inventory);
		this.elements.skills.textContent = skillText(state.player.skills);
		this.elements.performance.textContent = `${performance.fps} FPS · ${performance.id}`;
		this.elements.actions.replaceChildren(...realmActions(state, context).map(item => this.actionButton(item)));
		this.elements.chronicle.replaceChildren(...chronicleNodes(state));
		this.account.render(state);
	}

	message(text, tone = '') {
		this.elements.message.textContent = text;
		this.elements.message.dataset.tone = tone;
	}

	actionButton(item) {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = item.label;
		button.disabled = item.disabled;
		button.dataset.realmAction = item.id;
		button.addEventListener('click', () => this.callbacks.action(item.id));
		return button;
	}

	bindMovement(move) {
		this.layer.querySelectorAll('[data-move]').forEach(button => {
			const [x, z] = button.dataset.move.split(',').map(Number);
			const start = event => { event.preventDefault(); move(x, z); };
			const stop = event => { event.preventDefault(); move(0, 0); };
			button.addEventListener('pointerdown', start);
			button.addEventListener('pointerup', stop);
			button.addEventListener('pointercancel', stop);
			button.addEventListener('pointerleave', stop);
		});
	}
}

function clockText(minute) {
	const hour = Math.floor(minute / 60) % 24;
	return `Day ${Math.floor(minute / 1440) + 1} · ${String(hour).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

function strongestRole(state) {
	const strongest = Object.values(state.player.skills).reduce((best, skill) => !best || skill.level > best.level || skill.level === best.level && skill.xp > best.xp ? skill : best, null);
	return `${label(strongest.id)} · level ${strongest.level}`;
}

function inventoryText(inventory) {
	return Object.entries(inventory).filter(([, amount]) => amount > 0).map(([id, amount]) => `${label(id)} ${amount}`).join(' · ');
}

function skillText(skills) {
	return Object.values(skills).map(skill => `${label(skill.id)} ${skill.level}`).join(' · ');
}

function eventMarkup(event) {
	return event ? `<small>LIVE EVENT</small><strong>${event.title}</strong><span>${event.warning} · response ${event.progress}/3</span>` : '<small>WORLD STATUS</small><strong>No active emergency</strong><span>The town continues its schedules and work.</span>';
}

function chronicleNodes(state) {
	return [...state.chronicle].reverse().slice(0, 8).map(entry => {
		const paragraph = document.createElement('p');
		paragraph.textContent = entry.text;
		return paragraph;
	});
}

function label(value) {
	return String(value).replace(/([A-Z])/g, ' $1').replace(/^./, letter => letter.toUpperCase());
}
