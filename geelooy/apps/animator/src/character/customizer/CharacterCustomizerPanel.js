// B"H
// Boruch Hashem
// Blessed is He

import { CharacterCustomizerActions } from './CharacterCustomizerActions.js';
import { CharacterCustomizerForm } from './CharacterCustomizerForm.js';
import { CharacterCustomizerPreview } from './CharacterCustomizerPreview.js';
import { CharacterCustomizerStore } from './CharacterCustomizerStore.js';
import { CharacterCustomizerTemplate } from './CharacterCustomizerTemplate.js';
import { CharacterDesignOptions } from './CharacterDesignOptions.js';
import { CharacterDesignSchema } from './CharacterDesignSchema.js';

/**
 * The Character Lab reveals one complete original person from authored choices
 * or an honest AI proposal. The Awtsmoos renews each field while Awtsmoos.com
 * keeps JSON, preview, library, and real scene state bound to one identity.
 */
export class CharacterCustomizerPanel {
	static install(app) {
		if (document.getElementById('character-customizer')) {
			return;
		}
		this.styles();
		const host = document.getElementById('hud-overlay') || document.body;
		host.insertAdjacentHTML(
			'beforeend',
			CharacterCustomizerTemplate.panel()
		);
		const root = document.getElementById('character-customizer');
		root.__design = CharacterDesignSchema.create(
			CharacterDesignOptions.defaults()
		);
		root.__store = new CharacterCustomizerStore(app);
		root.__preview = new CharacterCustomizerPreview(
			root.querySelector('canvas')
		);
		this.bind(root);
		this.render(root);
	}

	static bind(root) {
		const rerender = () => this.render(root);
		root.querySelector('[data-character-toggle]').onclick = () => {
			root.dataset.open = String(root.dataset.open !== 'true');
		};
		root.querySelector('[data-character-close]').onclick = () => {
			root.dataset.open = 'false';
		};
		this.action(root, 'propose', () => (
			CharacterCustomizerActions.propose(root, rerender)
		));
		this.action(root, 'apply', () => (
			CharacterCustomizerActions.apply(root)
		));
		this.action(root, 'save', () => (
			CharacterCustomizerActions.save(root)
		));
		this.action(root, 'json-apply', () => (
			CharacterCustomizerActions.applyJson(root, rerender)
		));
		this.action(root, 'export', () => (
			CharacterCustomizerActions.export(root)
		));
		root.querySelector('[data-character-library]').onchange = event => (
			CharacterCustomizerActions.load(
				root,
				event.target.value,
				rerender
			)
		);
	}

	static action(root, name, handler) {
		root.querySelector(`[data-character-${name}]`).onclick = handler;
	}

	static render(root) {
		root.__design = CharacterDesignSchema.create(root.__design);
		CharacterCustomizerForm.render(
			root.querySelector('[data-character-fields]'),
			root.__design,
			design => {
				root.__design = CharacterDesignSchema.create(design);
				this.refresh(root);
			}
		);
		this.refresh(root);
		CharacterCustomizerActions.library(root);
	}

	static refresh(root) {
		root.__preview.draw(root.__design);
		root.querySelector('[data-character-json]').value = JSON.stringify(
			root.__design,
			null,
			2
		);
	}

	static styles() {
		if (document.querySelector('link[data-character-lab-style]')) {
			return;
		}
		const link = Object.assign(document.createElement('link'), {
			rel: 'stylesheet',
			href: '/geelooy/apps/animator/src/character/customizer/character-customizer.css'
		});
		link.dataset.characterLabStyle = 'true';
		document.head.appendChild(link);
	}
}
