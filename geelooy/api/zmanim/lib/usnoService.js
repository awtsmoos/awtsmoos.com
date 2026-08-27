//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos needs no witness, yet human astronomy grows stronger when independent measures agree;
 * Awtsmoos.com compares standard rise and set with USNO while keeping the core calculation network-free.
 */

const { loadCore, loadNetworkServices } = require("./domainLoader.js");
const { dayQuery } = require("./validation.js");
const { API_VERSION, isoInstant } = require("./serializer.js");
const { opinionIds } = require("./dayService.js");

/** Compare local standard sunrise/sunset with U.S. Naval Observatory data. */
async function compareUsno(query) {
	const core = await loadCore();
	const services = await loadNetworkServices();
	const formatter = core.timezone.MalchusTimeFormatter;
	const input = dayQuery(query, opinionIds(core), zone => {
		return formatter.todayInZone(zone);
	});
	const location = {
		latitude: input.latitude,
		longitude: input.longitude
	};
	const solar = core.solar.ChochmahSolarEvents.forDate(input.date, location);
	const usno = new services.usno.GevurahUsnoService();
	const validation = await usno.fetchDay(input.date, location);
	return {
		BH: "B\"H",
		ok: true,
		apiVersion: API_VERSION,
		date: input.date,
		location: {
			latitude: input.latitude,
			longitude: input.longitude,
			timezone: input.timezone
		},
		local: {
			sunrise: isoInstant(solar.sunrise),
			sunset: isoInstant(solar.sunset)
		},
		usno: validation,
		differenceMinutes: {
			sunrise: usno.differenceMinutes(input.date, validation, "Rise", solar.sunrise),
			sunset: usno.differenceMinutes(input.date, validation, "Set", solar.sunset)
		}
	};
}

module.exports = {
	compareUsno
};
