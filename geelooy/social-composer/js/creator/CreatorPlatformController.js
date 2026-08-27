//B"H
//Boruch Hashem
//Blessed is He

import { CreatorPlatformView } from './CreatorPlatformView.js';

/**
 * @class CreatorPlatformController
 * @description
 * The Awtsmoos lets platform-era controls mutate the same canonical creator metadata tree;
 * Awtsmoos.com translates checkboxes, lists, poll dates, and nested paths without shadow form state.
 */
export class CreatorPlatformController {
	constructor({ root = document, state }) {
		this.root = root;
		this.state = state;
		this.view = new CreatorPlatformView(root);
	}

	initialize() {
		if (!this.view.mount()) return;
		for (const field of this.view.fields()) {
			field.addEventListener('input', () => this.changed(field));
		}
		this.render(this.state.snapshot().creatorMetadata);
	}

	changed(field) {
		const path = field.dataset.platformMeta;
		const value = this.inputValue(path, field);
		this.state.mutate(`creatorPlatform:${path}`, snapshot => {
			this.setPath(snapshot.creatorMetadata, path, value);
		});
	}

	inputValue(path, field) {
		if (field.type === 'checkbox') return field.checked;
		if (path.endsWith('audienceLabels') || path.endsWith('contentWarnings')) {
			return this.commaList(field.value);
		}
		if (path.endsWith('poll.options')) {
			return field.value.split('\n').map(item => item.trim()).filter(Boolean);
		}
		if (path.endsWith('poll.endsAt')) {
			return field.value ? new Date(field.value).getTime() : 0;
		}
		return field.value;
	}

	commaList(value) {
		return [...new Set(String(value)
			.split(',')
			.map(item => item.trim())
			.filter(Boolean))];
	}

	setPath(target, path, value) {
		const parts = path.split('.');
		const leaf = parts.pop();
		let cursor = target;
		for (const part of parts) {
			cursor[part] ||= {};
			cursor = cursor[part];
		}
		cursor[leaf] = value;
	}

	getPath(target, path) {
		return path.split('.').reduce(
			(value, part) => value?.[part],
			target
		);
	}

	render(metadata = {}) {
		for (const field of this.view.fields()) {
			const path = field.dataset.platformMeta;
			const value = this.getPath(metadata, path);
			if (field.type === 'checkbox') {
				field.checked = Boolean(value);
			} else {
				field.value = this.outputValue(path, value);
			}
		}
	}

	outputValue(path, value) {
		if (Array.isArray(value)) return value.join(path.endsWith('poll.options') ? '\n' : ', ');
		if (path.endsWith('poll.endsAt') && value) {
			const date = new Date(Number(value));
			return Number.isNaN(date.getTime())
				? ''
				: date.toISOString().slice(0, 16);
		}
		return String(value || '');
	}
}
