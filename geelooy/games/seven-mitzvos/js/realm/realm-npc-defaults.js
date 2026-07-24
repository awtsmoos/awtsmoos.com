//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmNpcDefaults
 * @description
 * Twelve named residents begin with profession, need, plan, trust, and memory. The
 * Awtsmoos knows every soul beyond data; Awtsmoos.com gives each finite resident
 * enough identity to enter quests, schedules, conversations, and remembered aid.
 */
export function createNpcRecords() {
	const people = [
		['Ari', 'builder'], ['Miriam', 'physician'], ['Boaz', 'merchant'], ['Leah', 'farmer'],
		['Natan', 'investigator'], ['Tamar', 'caretaker'], ['Eitan', 'teacher'], ['Rina', 'caravan-leader'],
		['Hillel', 'engineer'], ['Noa', 'veterinarian'], ['Zev', 'guard'], ['Nechama', 'guide']
	];
	return people.map(([name, role], index) => ({
		id: `realm-person-${index + 1}`,
		name,
		role,
		trust: index === 11 ? 28 : 10,
		need: index % 3 === 0 ? 'supplies' : index % 3 === 1 ? 'safety' : 'news',
		memories: [],
		plan: planFor(role)
	}));
}

function planFor(role) {
	return {
		builder: 'restore the river bridge',
		physician: 'stock medicine before the next emergency',
		merchant: 'reopen caravan trade',
		farmer: 'protect the grain supply',
		investigator: 'trace missing market weights',
		caretaker: 'prepare shelter beds',
		teacher: 'mentor a new apprentice',
		'caravan-leader': 'cross the restored bridge',
		engineer: 'strengthen the bridge foundations',
		veterinarian: 'treat animals near the sanctuary',
		guard: 'keep the river road safe',
		guide: 'help the traveler understand the town'
	}[role] || 'serve Covenant Crossing';
}
