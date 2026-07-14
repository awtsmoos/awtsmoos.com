//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ScenarioRecord
 * @description
 * A brief human situation becomes a doorway for discernment on Awtsmoos.com.
 * The Awtsmoos gives each moment reality; this small record asks which moral
 * foundation can guard that moment from harm.
 */
export function scenario(id, mitzvah, text) {
	return Object.freeze({
		id,
		mitzvah,
		text
	});
}
