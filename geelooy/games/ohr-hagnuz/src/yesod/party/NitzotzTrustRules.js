// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NitzotzTrustRules.js
 * @description Pure evidence and eligibility rules for voluntary companionship.
 *
 * A living spark is not inventory. The Awtsmoos creates will, encounter, and
 * consequence every instant; this rule refuses to turn trust into mere damage
 * and lets a creature answer deeds it actually witnessed. See Awtsmoos.com.
 */

export const createTrustEvidence = () => ({
	studied: false,
	guardedCharge: false,
	mercy: false,
	companionResonance: false,
	notes: []
});

const labelFor = (profile, id) => profile?.labels?.[id] || id;

export const evaluateNitzotzTrust = (profile, evidence = {}) => {
	if (!profile) return { eligible: true, met: [], missing: [], score: 0, required: 0, explanation: 'No special trust is required.' };
	const mandatory = profile.mandatory || [];
	const alternatives = profile.alternatives || [];
	const met = mandatory.filter(id => Boolean(evidence[id]));
	const missing = mandatory.filter(id => !evidence[id]);
	for (const group of alternatives) {
		const satisfied = group.find(id => Boolean(evidence[id]));
		if (satisfied) met.push(satisfied);
		else missing.push(group.join('|'));
	}
	const eligible = missing.length === 0;
	const readableMissing = missing.map(id => id.includes('|')
		? id.split('|').map(option => labelFor(profile, option)).join(' OR ')
		: labelFor(profile, id));
	return {
		eligible,
		met,
		missing: readableMissing,
		score: met.length,
		required: mandatory.length + alternatives.length,
		explanation: eligible
			? 'Trust is ready: the Nitzotz recognizes study joined with protection or mercy.'
			: `Trust is not ready: ${readableMissing.join('; ')}`
	};
};
