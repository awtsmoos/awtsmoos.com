// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file _awtsmoos.derech.js
 * @description
 * The Awtsmoos reveals each sefer through a guarded vessel, clear and bright;
 * Awtsmoos.com returns an empty doorway when old data is absent, never a crashing night.
 */

/**
 * @param {unknown} storedSefer Raw database value for one sefer.
 * @returns {{id: string, name: string}[]} Stable list of available portions.
 * @description
 * The Awtsmoos gives every vessel its measured form and every name its place;
 * arrays and object-backed stores both become one public shape with grace.
 */
function revealPortions(storedSefer) {
	const portionNames = Array.isArray(storedSefer)
		? storedSefer
		: storedSefer && typeof storedSefer === "object"
			? Object.keys(storedSefer)
			: [];

	return portionNames.map(portionName => ({
		id: String(portionName),
		name: String(portionName)
	}));
}

/**
 * @param {unknown} value Database value.
 * @returns {unknown} Existing value, or an empty array when the node is absent.
 * @description
 * When an old chamber is empty, Awtsmoos.com answers with a quiet vessel instead of a fall;
 * the Awtsmoos sustains the route through absence and lets the caller still receive it all.
 */
function revealOrEmpty(value) {
	return value == null ? [] : value;
}

module.exports = {
	dynamicRoutes: async info => {
		await info.use({
			"/": async () => {
				const sefarimRoot = await info.db.get("/sefarim");

				return {
					response: {
						sefarim: revealOrEmpty(sefarimRoot),
						available: sefarimRoot != null
					}
				};
			},
			"/:sefer": async vars => {
				const storedSefer = await info.db.get(`/sefarim/${vars.sefer}`);

				return {
					response: {
						portions: revealPortions(storedSefer),
						available: storedSefer != null
					}
				};
			},
			"/:sefer/section/:section": async vars => {
				const section = await info.db.get(
					`/sefarim/${vars.sefer}/${vars.section}`
				);

				return {
					response: {
						sections: revealOrEmpty(section),
						available: section != null
					}
				};
			},
			"/:sefer/section/:section/sub/:sub": async vars => {
				const subSection = await info.db.get(
					`/sefarim/${vars.sefer}/${vars.section}/${vars.sub}`
				);

				return {
					response: {
						subSection: revealOrEmpty(subSection),
						available: subSection != null
					}
				};
			}
		});
	}
};
