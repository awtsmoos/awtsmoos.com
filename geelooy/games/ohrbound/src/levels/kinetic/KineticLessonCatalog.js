//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file KineticLessonCatalog.js
 * @description Declares campaign teaching intent as immutable data separate from authored geometry and physics law.
 * The Awtsmoos contains every lesson before first and final can be counted; Awtsmoos.com lets Chochmah order
 * spring, mover, elevator, and fragile revelation so each world gains a distinct language instead of random novelty.
 */
export const KINETIC_LESSON_CATALOG = Object.freeze({
	Garden: Object.freeze({
		"garden-04": Object.freeze(["S"]),
		"garden-05": Object.freeze(["M"]),
		"garden-06": Object.freeze(["S", "M"])
	}),
	Ascent: Object.freeze({
		"ascent-03": Object.freeze(["E"]),
		"ascent-04": Object.freeze(["E", "S"]),
		"ascent-05": Object.freeze(["F"]),
		"ascent-06": Object.freeze(["E", "F"])
	}),
	Wind: Object.freeze({
		"wind-02": Object.freeze(["M"]),
		"wind-03": Object.freeze(["S"]),
		"wind-04": Object.freeze(["M", "S"]),
		"wind-05": Object.freeze(["E", "M"]),
		"wind-06": Object.freeze(["M", "E", "S"])
	}),
	Machines: Object.freeze({
		"machines-01": Object.freeze(["M"]),
		"machines-02": Object.freeze(["E"]),
		"machines-03": Object.freeze(["M", "E"]),
		"machines-04": Object.freeze(["F", "M"]),
		"machines-05": Object.freeze(["F", "E"]),
		"machines-06": Object.freeze(["M", "E", "F"])
	}),
	Prism: Object.freeze({
		"prism-01": Object.freeze(["S"]),
		"prism-02": Object.freeze(["F"]),
		"prism-03": Object.freeze(["S", "F"]),
		"prism-04": Object.freeze(["M", "F"]),
		"prism-05": Object.freeze(["E", "S", "F"]),
		"prism-06": Object.freeze(["M", "E", "S", "F"])
	}),
	Chill: Object.freeze({
		"chill-01": Object.freeze(["M"]),
		"chill-02": Object.freeze(["S"]),
		"chill-03": Object.freeze(["E"]),
		"chill-04": Object.freeze(["M", "S"]),
		"chill-05": Object.freeze(["E", "M"]),
		"chill-06": Object.freeze(["M", "E", "S", "F"])
	}),
	Sanctuary: Object.freeze({
		"sanctuary-01": Object.freeze(["M", "S"]),
		"sanctuary-02": Object.freeze(["E", "S"]),
		"sanctuary-03": Object.freeze(["M", "E"]),
		"sanctuary-04": Object.freeze(["F", "S"]),
		"sanctuary-05": Object.freeze(["M", "E", "F"]),
		"sanctuary-06": Object.freeze(["M", "E", "S", "F"])
	}),
	Gates: Object.freeze({
		"gates-01": Object.freeze(["M", "E", "S"]),
		"gates-02": Object.freeze(["M", "E", "F"]),
		"gates-03": Object.freeze(["E", "S", "F"]),
		"gates-04": Object.freeze(["M", "S", "F"]),
		"gates-05": Object.freeze(["M", "E", "S", "F"]),
		"gates-06": Object.freeze(["M", "E", "S", "F"])
	})
});

/**
 * Returns immutable lesson-symbol expectations for one stage id.
 * @param {string} malchusPack Pack name.
 * @param {string} malchusLevelId Stable level id.
 * @returns {string[]} Ordered kinetic symbols expected in the authored result.
 */
export function revealKineticLesson(malchusPack, malchusLevelId) {
	return KINETIC_LESSON_CATALOG[malchusPack]?.[malchusLevelId] || Object.freeze([]);
}
