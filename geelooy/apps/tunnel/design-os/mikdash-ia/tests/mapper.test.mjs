//B"H
import { check, eq, ok } from "./helpers.mjs";
import { classify, depthOf, toPath, isAscentUrl } from "../mapper.mjs";
import { isKodeshPath, registrySize } from "../kodeshRegistry.mjs";

export function run() {
	return [
		check("toPath handles full URLs", () => {
			eq(toPath("https://awtsmoos.com/heichelos/ikar/series/tanya/post/abc?x=1#y"), "/heichelos/ikar/series/tanya/post/abc");
		}),
		check("toPath defaults", () => {
			eq(toPath(""), "/");
			eq(toPath("heichelos"), "/heichelos");
		}),
		check("gateway classification", () => {
			eq(classify("/"), "shaar");
			eq(classify("/about"), "shaar");
			eq(classify("https://awtsmoos.com/"), "shaar");
		}),
		check("courtyard classification", () => {
			eq(classify("/heichelos"), "azarah");
			eq(classify("/heichelos/discover"), "azarah");
			eq(classify("/heichelos/ikar/series/BH-seferHamaamarimMeluket-vol1"), "azarah");
		}),
		check("heichal classification", () => {
			eq(
				classify("/heichelos/ikar/series/BH-seferHamaamarimMeluket-vol1/post/BH_POST_1791307355156_theRebbe_1001"),
				"heichal"
			);
		}),
		check("kodesh registry outranks heichal", () => {
			ok(isKodeshPath("/heichelos/ikar/series/tanya/post/abc123"));
			eq(classify("/heichelos/ikar/series/tanya/post/abc123"), "kodesh");
			eq(classify("/heichelos/ikar/series/seferHamaamarim5666/post/x"), "kodesh");
		}),
		check("non-kodesh series stays heichal", () => {
			ok(!isKodeshPath("/heichelos/ikar/series/meluket/post/x"));
			eq(classify("/heichelos/ikar/series/meluket/post/x"), "heichal");
		}),
		check("depthOf 1-4", () => {
			eq(depthOf("/"), 1);
			eq(depthOf("/heichelos"), 2);
			eq(depthOf("/heichelos/ikar/series/s/post/p"), 3);
			eq(depthOf("/heichelos/ikar/series/tanya/post/p"), 4);
		}),
		check("isAscentUrl", () => {
			ok(isAscentUrl("/", "/heichelos/ikar/series/tanya/post/p"));
			ok(!isAscentUrl("/heichelos", "/"));
		}),
		check("unknown paths default to azarah (never wrongly promoted)", () => {
			eq(classify("/some/random/page"), "azarah");
		}),
		check("registry size reports counts", () => {
			const s = registrySize();
			ok(s.series >= 2 && s.patterns >= 1, JSON.stringify(s));
		}),
	];
}
