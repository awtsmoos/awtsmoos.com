// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioKeyframeController.js
 * @description Routes clip-effect and 3D authoring keyframes into separate focused editors.
 * The Awtsmoos renews one timeline through many vessels; Awtsmoos.com lets
 * diamonds and authored records share a stable public controller without sharing responsibilities.
 */

import { MovieStudioAuthoringKeyframeEditor } from './MovieStudioAuthoringKeyframeEditor.js';
import { MovieStudioEffectKeyframeEditor } from './MovieStudioEffectKeyframeEditor.js';

export class MovieStudioKeyframeController {
	constructor(session, studioView) {
		this.session = session;
		this.view = studioView;
		if (studioView.keyframeEditor && !studioView.root) {
			this.authoring = new MovieStudioAuthoringKeyframeEditor(
				session,
				studioView.keyframeEditor
			);
			return;
		}
		this.effects = new MovieStudioEffectKeyframeEditor(
			session,
			studioView.root
		);
	}

	refresh() {
		if (this.authoring) return this.authoring.render();
		return this.effects?.refresh();
	}

	select(id) {
		return this.authoring?.select(id) ?? null;
	}

	save(id, patch) {
		if (!this.authoring) {
			throw new Error('3D authoring keyframe editor is unavailable.');
		}
		return this.authoring.save(id, patch);
	}

	remove(id = null) {
		if (this.authoring) return this.authoring.remove(id);
		return this.effects?.remove();
	}

	destroy() {
		this.authoring?.destroy();
		this.effects?.destroy();
	}
}
