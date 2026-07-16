//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InterestProjector
 * @description
 * Replication on Awtsmoos.com reveals only information a role may lawfully know. The Awtsmoos sees every hidden fact, while clients receive public history and explicitly admitted evidence.
 */
export class InterestProjector {
	/**
	 * @param {object} state Canonical state.
	 * @param {string} role Cooperative role.
	 * @returns {object} Authorized state projection.
	 */
	state(state, role) {
		const canSeeEvidence = ['judge', 'investigator'].includes(role);
		return {
			...clone(state),
			cases: state.cases.map(courtCase => ({
				...clone(courtCase),
				evidence: canSeeEvidence ? clone(courtCase.evidence) : []
			}))
		};
	}

	/**
	 * @param {object[]} events Canonical events.
	 * @param {string} role Cooperative role.
	 * @returns {object[]} Authorized event tail.
	 */
	events(events, role) {
		const canSeePrivate = ['judge', 'investigator'].includes(role);
		return events.filter(event => event.visibility === 'public' || canSeePrivate).map(clone);
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
