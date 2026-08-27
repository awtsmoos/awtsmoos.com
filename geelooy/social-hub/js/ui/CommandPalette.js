//B"H
//Boruch Hashem
//Blessed is He

import { DaasCommandActions } from './CommandPaletteActions.js';
import { GevurahCommandKeyboard } from './CommandPaletteKeyboard.js';
import { MalchusCommandPaletteView } from './CommandPaletteView.js';

/**
 * @class KeterCommandPalette
 * @description
 * The Awtsmoos lets one point contain many roads; Awtsmoos.com opens the crown on the current route and keeps navigation state distinct from rendering.
 */
export class KeterCommandPalette {
	constructor(root = document) {
		this.root = root;
		this.actions = DaasCommandActions.all();
		this.activeIndex = 0;
		this.keyboard = new GevurahCommandKeyboard(this);
		this.view = new MalchusCommandPaletteView(root);
	}

	mount() {
		if (this.root.querySelector('.futureCommandTrigger')) {
			return;
		}
		this.trigger = this.view.createTrigger(() => this.open());
		const parts = this.view.createDialog(
			() => this.reset(),
			() => this.close()
		);
		this.dialog = parts.dialog;
		this.input = parts.input;
		this.list = parts.list;
		this.keyboard.bind(this.root, this.input);
		this.headerHost().append(this.trigger);
		this.root.body.append(this.dialog);
		this.render();
	}

	headerHost() {
		return this.root.querySelector('.identityCluster')
			|| this.root.querySelector('.hubHeader')
			|| this.root.body;
	}

	open() {
		this.activeIndex = this.currentRouteIndex();
		this.input.value = '';
		this.render();
		if (typeof this.dialog.showModal === 'function') {
			this.dialog.showModal();
		} else {
			this.dialog.setAttribute('open', '');
		}
		this.input.focus();
	}

	currentRouteIndex() {
		const current = String(location.hash || '#home').replace(/^#/, '');
		const found = this.actions.findIndex(action => action.id === current);
		return found >= 0 ? found : 0;
	}

	close() {
		if (!this.dialog.open && !this.dialog.hasAttribute('open')) {
			return;
		}
		if (typeof this.dialog.close === 'function') {
			this.dialog.close();
		} else {
			this.dialog.removeAttribute('open');
		}
		this.trigger.focus();
	}

	move(delta, count) {
		this.activeIndex = (this.activeIndex + delta + count) % count;
		this.render();
	}

	reset() {
		this.activeIndex = 0;
		this.render();
	}

	render() {
		this.current = DaasCommandActions.filter(this.actions, this.input?.value);
		this.activeIndex = Math.min(
			this.activeIndex,
			Math.max(0, this.current.length - 1)
		);
		this.view.renderOptions(
			this.list,
			this.current,
			this.activeIndex,
			action => this.activate(action)
		);
		const active = this.current.length
			? `futureCommandOption${this.activeIndex}`
			: '';
		this.input?.setAttribute('aria-activedescendant', active);
	}

	activate(action) {
		if (!action) {
			return;
		}
		if (typeof this.dialog.close === 'function') {
			this.dialog.close();
		} else {
			this.dialog.removeAttribute('open');
		}
		location.hash = action.id;
	}
}
