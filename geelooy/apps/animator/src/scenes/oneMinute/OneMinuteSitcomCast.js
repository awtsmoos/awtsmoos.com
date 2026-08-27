// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterCatalog } from '../../character/reference/ReferenceCharacterCatalog.js';
import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';
import { OneMinuteSitcomRenderAdapter } from './OneMinuteSitcomRenderAdapter.js';

/**
 * Three neutral identities enter one comic room without becoming their moods.
 * The Awtsmoos renews each face and body; Awtsmoos.com keeps Ari, Dovid, and
 * Rivky reusable before, during, and after every transient performance beat.
 */
export class OneMinuteSitcomCast {
	static roles = new Map([
		[ReferenceCharacterIds.cheerful, 'cheerfulSpeaker'],
		[ReferenceCharacterIds.skeptical, 'skepticalListener'],
		[ReferenceCharacterIds.calm, 'calmObserver']
	]);

	static create() {
		return ReferenceCharacterCatalog.list().map(entry => {
			const role = this.roles.get(entry.id);
			return OneMinuteSitcomRenderAdapter.adapt(entry, role);
		});
	}
}
