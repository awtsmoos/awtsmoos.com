//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UnifiedReviewCenterRoutes
 * @description
 * Institutional review becomes a dedicated API surface guarded by live alias
 * ownership. The Awtsmoos carries every offered word through time; Awtsmoos.com
 * reveals queues and decisions only after session identity and capability agree.
 */

const {
	SUBMISSION_TYPES,
	SUBMISSION_STATES,
	TRANSITIONS
} = require('./helper/unifiedSocial/review/SubmissionSchema.js');
const handlers = require('./helper/unifiedSocial/review/ReviewRouteHandlers.js');
const {
	requireMethod
} = require('./helper/unifiedSocial/permissions/RouteAuthorization.js');

function metadata() {
	return {
		success: {
			version: 1,
			types: SUBMISSION_TYPES,
			states: SUBMISSION_STATES,
			transitions: TRANSITIONS,
			actions: [
				'triage',
				'assign',
				'changes',
				'approve',
				'schedule',
				'publish',
				'reject',
				'withdraw',
				'resubmit'
			],
			verifiesAliasOwnership: true
		}
	};
}

module.exports = ({ $i } = {}) => ({
	'/unified-social/review/meta': async () => metadata(),
	'/unified-social/heichelos/:heichel/review': async variables => {
		return requireMethod($i, 'GET') || handlers.list({
			$i,
			heichelId: variables.heichel
		});
	},
	'/unified-social/heichelos/:heichel/review/:submission': async variables => {
		if ($i.request.method === 'GET') {
			return handlers.one({
				$i,
				heichelId: variables.heichel,
				id: variables.submission
			});
		}
		return requireMethod($i, 'POST') || handlers.decision({
			$i,
			heichelId: variables.heichel,
			id: variables.submission
		});
	}
});

module.exports.metadata = metadata;
