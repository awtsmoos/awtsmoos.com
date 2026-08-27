// B"H
// Boruch Hashem
// Blessed is He

import { CharacterCustomizerFieldCatalog } from './CharacterCustomizerFieldCatalog.js';

/**
 * The visible form and nested JSON are one covenant. The Awtsmoos renews both
 * representation and meaning; Awtsmoos.com writes every changed control into
 * the same design object used by preview, save, AI proposal, and render.
 */
export class CharacterCustomizerForm {
	static render(root, design, onChange) {
		root.innerHTML = CharacterCustomizerFieldCatalog.groups()
			.map(group => this.group(group, design))
			.join('');

		root.querySelectorAll('[data-character-path]').forEach(input => {
			input.addEventListener('input', () => {
				const value = input.type === 'range'
					? Number(input.value)
					: input.value;
				this.set(design, input.dataset.characterPath, value);
				const output = input.closest('label')?.querySelector('output');
				if (output) {
					output.textContent = String(input.value);
				}
				onChange(design);
			});
		});
	}

	static group(group, design) {
		const fields = group.fields
			.map(field => this.field(field, design))
			.join('');
		return `<fieldset><legend>${this.escape(group.name)}</legend><div class="character-grid">${fields}</div></fieldset>`;
	}

	static field(field, design) {
		const value = this.get(design, field.path) ?? '';
		const control = field.type === 'select'
			? this.select(field, value)
			: this.input(field, value);
		const output = field.type === 'range'
			? `<output>${value}</output>`
			: '';
		return `<label><span>${this.escape(field.label)}</span>${control}${output}</label>`;
	}

	static select(field, value) {
		const options = field.options.map(option => {
			const selected = option === value ? ' selected' : '';
			return `<option value="${this.escape(option)}"${selected}>${this.escape(this.title(option))}</option>`;
		}).join('');
		return `<select data-character-path="${field.path}">${options}</select>`;
	}

	static input(field, value) {
		const range = field.type === 'range'
			? ` min="${field.minimum}" max="${field.maximum}" step="${field.step}"`
			: '';
		return `<input data-character-path="${field.path}" type="${field.type}" value="${this.escape(value)}"${range}>`;
	}

	static get(object, path) {
		return path.split('.').reduce(
			(value, key) => value?.[key],
			object
		);
	}

	static set(object, path, value) {
		const keys = path.split('.');
		const final = keys.pop();
		const target = keys.reduce((item, key) => {
			item[key] ||= {};
			return item[key];
		}, object);
		target[final] = value;
	}

	static title(value) {
		return String(value)
			.replace(/([a-z])([A-Z])/gu, '$1 $2')
			.replace(/_/gu, ' ');
	}

	static escape(value) {
		const entities = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;'
		};
		return String(value).replace(
			/[&<>"]/gu,
			character => entities[character]
		);
	}
}
