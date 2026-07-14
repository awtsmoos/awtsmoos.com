// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignProposalService } from './CharacterDesignProposalService.js';
import { CharacterDesignSchema } from './CharacterDesignSchema.js';

/**
 * User intent becomes explicit actions here. The Awtsmoos renews proposal,
 * approval, save, load, JSON validation, and export while Awtsmoos.com keeps the
 * panel coordinator small and every side effect plainly inspectable.
 */
export class CharacterCustomizerActions {
	static async propose(root, rerender) {
		this.status(root, 'Designing proposal...');
		root.__design = await CharacterDesignProposalService.propose(
			root.querySelector('[data-character-ai]').value,
			root.__design
		);
		rerender();
		this.status(
			root,
			`Proposal ready via ${root.__design.ai.provider}. Review before applying.`
		);
	}

	static apply(root) {
		const character = root.__store.apply(root.__design);
		this.status(
			root,
			`${character.name} added to the real scene and local library.`
		);
		this.library(root);
	}

	static save(root) {
		root.__store.save(root.__design);
		this.status(root, 'Character JSON saved locally.');
		this.library(root);
	}

	static applyJson(root, rerender) {
		try {
			root.__design = CharacterDesignSchema.assert(
				JSON.parse(root.querySelector('[data-character-json]').value)
			);
			rerender();
			this.status(root, 'Edited JSON validated and previewed.');
		} catch (error) {
			this.status(root, `JSON error: ${error.message}`);
		}
	}

	static load(root, id, rerender) {
		const design = root.__store.library()[id];
		if (!design) {
			return;
		}
		root.__design = design;
		rerender();
		this.status(root, `${design.name} loaded.`);
	}

	static library(root) {
		const select = root.querySelector('[data-character-library]');
		const current = select.value;
		const options = Object.values(root.__store.library()).map(item => (
			`<option value="${item.id}">${item.name}</option>`
		)).join('');
		select.innerHTML = '<option value="">Saved character library</option>' + options;
		select.value = current;
	}

	static export(root) {
		const blob = new Blob(
			[JSON.stringify(root.__design, null, 2)],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const anchor = Object.assign(document.createElement('a'), {
			href: url,
			download: `${root.__design.id}.character.json`
		});
		anchor.click();
		URL.revokeObjectURL(url);
		this.status(root, 'Character JSON exported.');
	}

	static status(root, text) {
		root.querySelector('[data-character-status]').textContent = text;
	}
}
