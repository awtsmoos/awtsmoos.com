// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceTakeActions.js
 * @description Routes manual take-manager, audition, keep, and discard controls through canonical commands.
 * The Awtsmoos lets an acted memory be heard, inserted, preferred, judged, hidden, or restored;
 * Awtsmoos.com keeps every decision joined to history, validation, autosave, recovery, and timeline rhyme.
 */

import { movieStudioPerformanceMutations } from './MovieStudioPerformanceProject.js';
import { MovieStudioPerformanceTakeMetadataActions } from './MovieStudioPerformanceTakeMetadataActions.js';

export class MovieStudioPerformanceTakeActions {
	constructor(controller) {
		this.controller = controller;
		this.metadata = new MovieStudioPerformanceTakeMetadataActions(controller);
	}

	handle(action, id) {
		const session = this.controller.session;
		let result;
		if (action === 'delete') {
			result = movieStudioPerformanceMutations.deleteTake(session, id);
		} else if (action === 'restore') {
			result = movieStudioPerformanceMutations.restoreTake(session, id);
		} else if (action === 'insert') {
			result = movieStudioPerformanceMutations.insertTake(session, id, {
				start: session.time
			});
		} else if (action === 'preferred') {
			result = movieStudioPerformanceMutations.setPreferredTake(session, id);
		} else if (action === 'audition') {
			return this.audition(id);
		} else {
			result = this.metadata.handle(action, id);
			if (result == null) {
				throw new Error(`PERFORMANCE_TAKE_ACTION_INVALID:${action}`);
			}
		}
		this.controller.renderStatus();
		return result?.cancelled ? result : this.controller.status();
	}

	keepLast() {
		const takeId = this.requireLastAcceptedTake();
		movieStudioPerformanceMutations.setPreferredTake(
			this.controller.session,
			takeId
		);
		this.controller.renderStatus();
		return Object.freeze({ decision: 'kept', takeId });
	}

	discardLast() {
		const takeId = this.requireLastAcceptedTake();
		movieStudioPerformanceMutations.deleteTake(
			this.controller.session,
			takeId
		);
		this.controller.lastAcceptedTakeId = null;
		this.controller.renderStatus();
		return Object.freeze({ decision: 'discarded', takeId });
	}

	requireLastAcceptedTake() {
		const takeId = this.controller.lastAcceptedTakeId;
		const exists = this.controller.session.project.performance.takes.some(
			take => take.id === takeId
		);
		if (!takeId || !exists) {
			throw new Error('PERFORMANCE_LAST_TAKE_UNAVAILABLE');
		}
		return takeId;
	}

	audition(takeId) {
		const clip = this.controller.session.project.tracks
			.filter(track => track.type === 'performance')
			.flatMap(track => track.clips)
			.find(item => item.takeId === takeId);
		if (!clip) {
			throw new Error(`PERFORMANCE_TAKE_NOT_INSERTED:${takeId}`);
		}
		this.controller.session.seek(clip.start);
		this.controller.session.play();
		return Object.freeze({
			clipId: clip.id,
			takeId
		});
	}
}
