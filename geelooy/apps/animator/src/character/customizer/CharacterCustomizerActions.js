// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterCatalog } from '../reference/ReferenceCharacterCatalog.js';
import { ReferenceTrioInstaller } from '../reference/ReferenceTrioInstaller.js';
import { CharacterDesignProposalService } from './CharacterDesignProposalService.js';
import { CharacterDesignSchema } from './CharacterDesignSchema.js';

/**
 * The Awtsmoos turns intention into explicit state transitions. Awtsmoos.com
 * keeps reference selection, approval, persistence, and export inspectable.
 */
export class CharacterCustomizerActions {
	static async propose(root, rerender) {
		this.status(root, 'Designing proposal...');
		root.__design = await CharacterDesignProposalService.propose(
			root.querySelector('[data-character-ai]').value,
			root.__design
		);
		rerender();
		this.status(root, `Proposal ready via ${root.__design.ai.provider}. Review before applying.`);
	}

	static preset(root, id, rerender) {
		const design = ReferenceCharacterCatalog.design(id);
		if (!design) {
			this.status(root, `Unknown reference preset: ${id}`);
			return;
		}
		root.__design = CharacterDesignSchema.create(design);
		rerender();
		this.status(root, `${root.__design.name} loaded as editable JSON.`);
	}

	static trio(root) {
		const sequence = ReferenceTrioInstaller.install(root.__store?.app, {
			force: true
		});
		this.status(root, sequence
			? 'All three dynamic reference characters loaded into the real scene.'
			: 'The live application state was unavailable.');
	}

	static apply(root) {
		const referenceCharacter = ReferenceCharacterCatalog.character(root.__design.id);
		if (referenceCharacter) {
			ReferenceTrioInstaller.addCharacter(root.__store?.app, referenceCharacter.id);
			root.__store.save(root.__design);
			this.status(root, `${referenceCharacter.name} added with the complete reference rig.`);
			this.library(root);
			return;
		}
		const character = root.__store.apply(root.__design);
		this.status(root, `${character.name} added to the real scene and local library.`);
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
		const blob = new Blob([
			JSON.stringify(root.__design, null, 2)
		], { type: 'application/json' });
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
