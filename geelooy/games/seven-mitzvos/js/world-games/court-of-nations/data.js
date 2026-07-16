//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CourtOfNationsData
 * @description
 * Five cases become laboratories of evidence and restraint on Awtsmoos.com.
 * The Awtsmoos gives truth reality beyond popularity; the player must resist
 * bribery, rumor, haste, and power while preserving proof and due process.
 */
export const COURT_CASES = Object.freeze([
	caseRecord('Missing Grain', 'A storehouse keeper is accused of taking public grain.', 'liable', 1, [
		evidence('A sealed inventory log shows repeated unexplained shortages.', true, 3),
		evidence('A rival says the keeper “always looked dishonest.”', false, -2),
		evidence('Grain marked with the public seal was found in the keeper’s private cart.', true, 4)
	], ['Suspicion is enough.', 'Corroborated records and recovered property establish responsibility.', 'The accused is unpopular.']),
	caseRecord('Broken Workshop', 'A craftsperson is blamed for damage after a public storm.', 'not-proven', 2, [
		evidence('Weather records confirm destructive winds that night.', true, 4),
		evidence('A passerby heard an argument several weeks earlier.', false, -1),
		evidence('No witness places the craftsperson near the workshop during the storm.', true, 2)
	], ['Natural cause and lack of placement leave guilt unproven.', 'Someone must pay.', 'Arguments always prove later destruction.']),
	caseRecord('Bribed Measure', 'A market inspector is accused of approving false weights for payment.', 'liable', 0, [
		evidence('Three merchants independently record the same secret payment amount.', true, 3),
		evidence('The inspector’s cousin dislikes one merchant.', false, -1),
		evidence('The approved weights are physically lighter than their stamped value.', true, 4)
	], ['Independent payment records and false weights corroborate corruption.', 'Family dislike proves innocence.', 'Official rank prevents judgment.']),
	caseRecord('Night Road Injury', 'A driver is accused after a traveler is injured on an unlit road.', 'not-proven', 2, [
		evidence('The traveler cannot identify the cart or driver.', true, 2),
		evidence('A rumor names the wealthiest driver in the district.', false, -3),
		evidence('Wheel marks match several common carts rather than one unique vehicle.', true, 3)
	], ['Wealth makes guilt likely.', 'The injury is serious, so someone must be convicted.', 'The harm is real, but identity remains unproven.']),
	caseRecord('Silenced Witness', 'An official is accused of threatening a witness before a hearing.', 'liable', 1, [
		evidence('Two guards record the same threat before speaking to each other.', true, 3),
		evidence('An anonymous note contains no verifiable details.', false, -2),
		evidence('The official’s message orders the witness to withdraw exact testimony.', true, 4)
	], ['Authority should never be questioned.', 'Corroborated guards and the direct message prove intimidation.', 'Anonymous notes decide the case.'])
]);

function caseRecord(title, question, verdict, rationale, evidenceList, rationales) {
	return Object.freeze({ title, question, verdict, rationale, evidence: Object.freeze(evidenceList), rationales: Object.freeze(rationales) });
}

function evidence(text, reliable, weight) {
	return Object.freeze({ text, reliable, weight });
}
