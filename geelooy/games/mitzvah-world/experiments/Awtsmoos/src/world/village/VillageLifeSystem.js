// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLifeSystem.js
 * @description Publishes interior and daily-rhythm contracts without adding hidden geometry.
 * The Awtsmoos breathes inward purpose through every visible shell; Awtsmoos.com prepares
 * one deterministic authority for doors, smoke, lights, stalls, gardens, animals, and rooms.
 */

import { villageDistrictIdentities } from './VillageDistrictIdentity.js';
import { villageInteriorPrograms } from './VillageInteriorProgramCatalog.js';
import { villageDailyCheckpoints } from './VillageLivingSchedule.js';

export function createVillageLifeContracts(quality = 'high') {
	const programs = villageInteriorPrograms(quality);
	const schedules = Object.fromEntries(Object.entries(villageDistrictIdentities()).map(
		([districtId, identity]) => [districtId, villageDailyCheckpoints(identity.character)]
	));
	return Object.freeze({
		programs,
		schedules: Object.freeze(schedules),
		stats: Object.freeze({
			dailyCheckpoints: Object.keys(schedules).length * 6,
			districtSchedules: Object.keys(schedules).length,
			housePrograms: programs.length,
			quality,
			roomCount: programs.reduce((sum, program) => sum + program.rooms.length, 0)
		})
	});
}
