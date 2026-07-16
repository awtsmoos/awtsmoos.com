//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module OfflineActionService
 * @description
 * Disconnected players on Awtsmoos.com may queue bounded local intentions that
 * are revalidated against canonical state after reconnect. The Awtsmoos never
 * loses connection; finite networks reject stale or irreversible offline power.
 */
const ALLOWED_OFFLINE = Object.freeze([
	'VIEW_STATE',
	'READ_CHRONICLE',
	'DRAFT_PLAN',
	'PREPARE_MARKET_ORDER',
	'PREPARE_ROUTE',
	'PREPARE_CASE_NOTES',
	'CUSTOMIZE_INTERFACE',
	'ASSIGN_PERSONAL_LOADOUT'
]);

const FORBIDDEN_OFFLINE = Object.freeze([
	'RULE_CASE',
	'CREATE_TREATY',
	'BUY_RESOURCE',
	'CONSTRUCT',
	'TRANSFER_TREASURY',
	'ADMIN_ROLLBACK'
]);

export class OfflineActionService {
	queue(action, baseRevision) {
		if (FORBIDDEN_OFFLINE.includes(action.type)) {
			throw new Error('OfflineActionService: irreversible action requires authority');
		}
		if (!ALLOWED_OFFLINE.includes(action.type)) {
			throw new Error('OfflineActionService: action is not offline-capable');
		}
		return {
			...action,
			baseRevision,
			queuedAt: action.queuedAt || 0,
			status: 'queued'
		};
	}

	revalidate(actions, canonicalRevision, validator) {
		return actions.map(action => {
			const stale = canonicalRevision - action.baseRevision > 50;
			const validation = stale
				? { accepted: false, reason: 'stale_revision' }
				: validator(action);
			return {
				...action,
				status: validation.accepted ? 'accepted' : 'rejected',
				reason: validation.reason || null,
				canonicalRevision
			};
		});
	}
}
