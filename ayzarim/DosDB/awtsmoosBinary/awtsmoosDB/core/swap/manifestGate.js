// B"H

/**
 * @file core/swap/manifestGate.js
 * @chapter The Crown Is Withheld Until Every Witness Signs
 * @description
 * Refuses a live-file exchange unless an explicit approval manifest closes each
 * external gate that the vacuum itself deliberately leaves open.
 */

const REQUIRED_GATES = [
	'candidateVerified',
	'semanticDigestMatched',
	'apiMatrixPassed',
	'vectorParityPassed',
	'virtualFsParityPassed',
	'exclusiveOwnershipProven',
	'rollbackRehearsed',
	'archiveVerified'
];

function validateApproval(approval) {
	const errors = [];
	if (!approval || approval.format !== 'awtsmoosdb-production-approval-v1') {
		errors.push('approval format is missing or unsupported');
	}
	if (approval?.productionEligible !== true) errors.push('productionEligible is not true');
	for (const gate of REQUIRED_GATES) {
		if (approval?.gates?.[gate] !== true) errors.push(`gate not closed: ${gate}`);
	}
	for (const field of ['livePath', 'candidatePath', 'rollbackPath', 'liveSha256', 'candidateSha256']) {
		if (!approval?.[field]) errors.push(`missing approval field: ${field}`);
	}
	if (errors.length) {
		const error = new Error(`B"H production swap approval refused: ${errors.join('; ')}`);
		error.code = 'AWTSMOOS_DB_SWAP_GATE_REFUSED';
		error.details = errors;
		throw error;
	}
	return approval;
}

module.exports = {
	REQUIRED_GATES,
	validateApproval
};
