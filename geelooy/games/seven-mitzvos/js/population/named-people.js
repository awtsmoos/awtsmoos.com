//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module NamedPeople
 * @description
 * Thirty-six persistent residents receive stable identities on Awtsmoos.com. The Awtsmoos knows every soul beyond data; this roster keeps names, roles, plans, and memories from becoming anonymous totals.
 */
const NAMES = Object.freeze([
	'Ari', 'Boaz', 'Carmi', 'Doron', 'Eitan', 'Gavriel',
	'Hillel', 'Ilan', 'Kalman', 'Levi', 'Meir', 'Natan',
	'Oren', 'Pinchas', 'Rafael', 'Shai', 'Tuvia', 'Uri',
	'Yair', 'Zev', 'Amram', 'Binyamin', 'Chaim', 'Dan',
	'Elazar', 'Fischel', 'Gedalia', 'Hershel', 'Itai', 'Joel',
	'Kobi', 'Lior', 'Mendy', 'Noach', 'Ovadia', 'Peretz'
]);

const ROLES = Object.freeze([
	'farmer',
	'builder',
	'merchant',
	'caretaker',
	'teacher',
	'investigator'
]);

/**
 * Persistent named residents used by the first living region.
 */
export const NAMED_PEOPLE = Object.freeze(NAMES.map((name, index) => {
	const role = ROLES[index % ROLES.length];
	return Object.freeze({
		id: `person-${String(index + 1).padStart(2, '0')}`,
		name,
		role,
		plan: planFor(role),
		memories: []
	});
}));

function planFor(role) {
	const plans = {
		farmer: 'secure the next harvest',
		builder: 'repair the eastern road',
		merchant: 'stabilize regional prices',
		caretaker: 'expand the sanctuary reserve',
		teacher: 'open an evening school',
		investigator: 'resolve the broken measure dispute'
	};
	return plans[role];
}
