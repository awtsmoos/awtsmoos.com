// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterCatalog } from './ReferenceCharacterCatalog.js';
import { ReferenceTrioScene } from './ReferenceTrioScene.js';

/**
 * Hidden authored form enters the real state vessel here. The Awtsmoos renews
 * scene, characters, camera, and timeline together; Awtsmoos.com therefore
 * reloads the same editable trio instead of reconstructing a decorative copy.
 */
export class ReferenceTrioInstaller {
	static install(app, options = {}) {
		if (!app?.state) {
			return null;
		}
		const production = ReferenceTrioScene.create();
		const force = options.force === true || this.needsRefresh(app);
		if (!force) {
			return app.state.get('activeSequence');
		}
		app.state.set('scene', this.clone(production.scene), true);
		app.state.set('characters', this.clone(production.characters), true);
		app.state.set('props', this.clone(production.props), true);
		app.state.set('cameras', this.clone(production.cameras), true);
		app.state.set('activeSequence', this.clone(production.sequence), true);
		app.state.set('activeDialogue', null, true);
		app.state.set('_defaultSceneVersion', ReferenceTrioScene.version, true);
		app.state.set('camera', this.clone(production.cameras[0]), true);
		app.state.set('userPausedPlayback', false, true);
		console.log('B"H - [ReferenceTrioInstaller] Editable reference trio installed.');
		return production.sequence;
	}

	static addCharacter(app, characterId) {
		const character = ReferenceCharacterCatalog.character(characterId);
		if (!character || !app?.state) {
			return null;
		}
		const characters = app.state.get('characters') || {};
		app.state.set('characters', {
			...characters,
			[character.id]: this.clone(character)
		}, true);
		return character;
	}

	static needsRefresh(app) {
		return app.state.get('_defaultSceneVersion') !== ReferenceTrioScene.version;
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
