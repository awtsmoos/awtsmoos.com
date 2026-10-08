//B"H
import { check, eq, ok, throws } from "./helpers.mjs";
import { LEVELS, SHAAR, AZARAH, HEICHAL, KODESH_HAKODASHIM, getLevel, getLevelByNumber, isAscent, chromeBudget } from "../levels.mjs";

export function run() {
	return [
		check("four levels in ascent order", () => {
			eq(LEVELS.length, 4);
			eq(LEVELS[0].id, "shaar");
			eq(LEVELS[3].id, "kodesh");
		}),
		check("level numbers 1-4", () => {
			eq(SHAAR.level, 1);
			eq(AZARAH.level, 2);
			eq(HEICHAL.level, 3);
			eq(KODESH_HAKODASHIM.level, 4);
		}),
		check("getLevel by id", () => {
			eq(getLevel("heichal").english, "Sanctuary");
			throws(() => getLevel("nope"));
		}),
		check("getLevelByNumber", () => {
			eq(getLevelByNumber(4).id, "kodesh");
			throws(() => getLevelByNumber(5));
		}),
		check("isAscent only deeper", () => {
			ok(isAscent("shaar", "kodesh"));
			ok(isAscent("azarah", "heichal"));
			ok(!isAscent("heichal", "azarah"));
			ok(!isAscent("kodesh", "kodesh"));
		}),
		check("chrome budget shrinks with sanctity", () => {
			const b1 = chromeBudget("shaar");
			const b4 = chromeBudget("kodesh");
			ok(b1 > b4, "shaar budget must exceed kodesh budget");
			eq(b4, 1);
			throws(() => chromeBudget("nope"));
		}),
		check("every level has purpose, visual, rules", () => {
			for (const l of LEVELS) {
				ok(l.purpose, `${l.id} purpose`);
				ok(l.visual && l.visual.mood, `${l.id} visual.mood`);
				ok(Array.isArray(l.rules) && l.rules.length > 0, `${l.id} rules`);
				ok(l.nameHe, `${l.id} Hebrew name`);
			}
		}),
	];
}
