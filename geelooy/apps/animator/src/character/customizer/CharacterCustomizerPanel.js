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
 * @file CharacterCustomizerPanel.js
 * @description The Awtsmoos renews garment before form; Awtsmoos.com therefore
 * keeps Character Lab concealed until its module-relative stylesheet has truly arrived,
 * then binds one real design state to preview, prompt, library, JSON, and scene life.
 */
export class CharacterCustomizerPanel {
	static install(app) {
		if (document.getElementById('character-customizer')) {
			return;
		}
		const host = document.getElementById('hud-overlay') || document.body;
		host.insertAdjacentHTML('beforeend', CharacterCustomizerTemplate.panel());
		const root = document.getElementById('character-customizer');
		root.__design = CharacterDesignSchema.create(CharacterDesignOptions.defaults());
		root.__store = new CharacterCustomizerStore(app);
		root.__preview = new CharacterCustomizerPreview(root.querySelector('canvas'));
		this.bind(root);
		this.render(root);
		this.loadStyles(root);
	}

	static bind(root) {
		const rerender = () => this.render(root);
		root.querySelector('[data-character-toggle]').onclick = () => {
			root.dataset.open = String(root.dataset.open !== 'true');
		};
		root.querySelector('[data-character-close]').onclick = () => {
			root.dataset.open = 'false';
		};
		this.action(root, 'propose', () => CharacterCustomizerActions.propose(root, rerender));
		this.action(root, 'apply', () => CharacterCustomizerActions.apply(root));
		this.action(root, 'save', () => CharacterCustomizerActions.save(root));
		this.action(root, 'json-apply', () => CharacterCustomizerActions.applyJson(root, rerender));
		this.action(root, 'export', () => CharacterCustomizerActions.export(root));
		this.action(root, 'trio', () => CharacterCustomizerActions.trio(root));
		root.querySelectorAll('[data-character-preset]').forEach((button) => {
			button.onclick = () => CharacterCustomizerActions.preset(
				root,
				button.dataset.characterPreset,
				rerender
			);
		});
		root.querySelector('[data-character-library]').onchange = (event) => {
			CharacterCustomizerActions.load(root, event.target.value, rerender);
		};
	}

	static action(root, name, handler) {
		const control = root.querySelector(`[data-character-${name}]`);
		if (control) {
			control.onclick = handler;
		}
	}

	static render(root) {
		root.__design = CharacterDesignSchema.create(root.__design);
		CharacterCustomizerForm.render(
			root.querySelector('[data-character-fields]'),
			root.__design,
			(design) => {
				root.__design = CharacterDesignSchema.create(design);
				this.refresh(root);
			}
		);
		this.refresh(root);
		CharacterCustomizerActions.library(root);
	}

	static refresh(root) {
		root.__preview.draw(root.__design);
		root.querySelector('[data-character-json]').value = JSON.stringify(root.__design, null, 2);
	}

	static loadStyles(root) {
		const existing = document.querySelector('link[data-character-lab-style]');
		if (existing) {
			this.revealWhenReady(root, existing);
			return;
		}
		const link = Object.assign(document.createElement('link'), {
			rel: 'stylesheet',
			href: new URL('./character-customizer.css', import.meta.url).href
		});
		link.dataset.characterLabStyle = 'true';
		this.revealWhenReady(root, link);
		document.head.appendChild(link);
	}

	static revealWhenReady(root, link) {
		if (link.sheet) {
			root.hidden = false;
			return;
		}
		link.addEventListener('load', () => {
			root.hidden = false;
		}, { once: true });
		link.addEventListener('error', () => {
			console.error('Character Lab stylesheet failed to load:', link.href);
		}, { once: true });
	}
}
