// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectReplacementRecovery.js
 * @description Saves a verified recovery generation before destructive project replacement.
 * The Awtsmoos renews former and arriving stories without loss; Awtsmoos.com gives
 * browser persistence first refusal, memory fallback, canonical history, and explicit recovery evidence.
 */

import { saveMovieStudioPersistence } from './MoviePersistenceOperations.js';

export async function commitMovieProjectWithRecovery(session, project, label) {
	const recovery = await preserveMovieProjectBeforeReplacement(session, label);
	const result = session.commands.commitProject(project, label);
	session.events?.emit('project:recovery-created', recovery);
	return { recovery, result };
}

export async function preserveMovieProjectBeforeReplacement(session, reason) {
	const key = recoveryKey(session, reason);
	for (const adapterId of ['localStorage', 'memory']) {
		try {
			await saveMovieStudioPersistence(session, {
				adapterId,
				key,
				metadata: {
					reason,
					source: 'before-destructive-replacement'
				}
			});
			return { adapterId, key, ok: true, reason };
		} catch (error) {
			if (adapterId === 'memory') {
				return {
					adapterId,
					error: String(error?.message || error),
					key,
					ok: false,
					reason
				};
			}
		}
	}
	return { key, ok: false, reason };
}

function recoveryKey(session, reason) {
	const revision = Number(session.revision || 0);
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const suffix = String(reason || 'replacement')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 40);
	return `recovery-r${revision}-${stamp}-${suffix || 'replacement'}`;
}
