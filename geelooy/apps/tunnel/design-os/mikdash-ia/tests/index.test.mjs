//B"H
import { check, eq, ok } from "./helpers.mjs";
import { mikdash } from "../index.mjs";

export function run() {
	return [
		check("mikdash() gateway context", () => {
			const m = mikdash("/");
			eq(m.level.id, "shaar");
			eq(m.depth, 1);
			ok(m.trail.length === 1);
			ok(!m.kavanahRequired);
			eq(m.returnPath, null);
		}),
		check("mikdash() kodesh context is complete", () => {
			const m = mikdash("https://awtsmoos.com/heichelos/ikar/series/tanya/post/abc");
			eq(m.level.id, "kodesh");
			eq(m.depth, 4);
			eq(m.chromeBudget, 1);
			eq(m.trail.length, 4);
			ok(m.breadcrumbsHtml.includes("Kodesh HaKodashim") || m.breadcrumbsHtml.includes("קודש הקודשים"));
			ok(m.themeDsl.includes("chrome.count = 0"));
			ok(m.tokens.background);
			ok(m.cssVars.includes("--mikdash-bg"));
			eq(m.kavanahRequired, true);
			ok(m.returnPath, "return path present");
		}),
		check("mikdash() heichal context", () => {
			const m = mikdash("/heichelos/ikar/series/BH-seferHamaamarimMeluket-vol1/post/BH_POST_1");
			eq(m.level.id, "heichal");
			eq(m.depth, 3);
			ok(!m.kavanahRequired);
			ok(m.themeDsl.includes("title.fontSize = 4 * body.fontSize"));
		}),
	];
}
