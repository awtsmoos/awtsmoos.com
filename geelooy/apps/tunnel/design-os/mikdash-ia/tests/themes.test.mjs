//B"H
import { check, eq, ok, throws } from "./helpers.mjs";
import { themeDsl, tokens, themeCssVars, THEME_DSL_BY_LEVEL, TOKENS } from "../themes.mjs";
import { design } from "../../constraints/index.mjs";

export function run() {
	return [
		check("four theme bundles", () => {
			eq(Object.keys(THEME_DSL_BY_LEVEL).length, 4);
			eq(Object.keys(TOKENS).length, 4);
		}),
		check("themeDsl throws on unknown", () => {
			throws(() => themeDsl("nope"));
			throws(() => tokens("nope"));
		}),
		check("all four DSL bundles parse and validate", () => {
			for (const [level, dsl] of Object.entries(THEME_DSL_BY_LEVEL)) {
				const r = design(dsl);
				ok(r.ok, `${level}: ${JSON.stringify(r.errors)}`);
			}
		}),
		check("heichal solves title at 4x body", () => {
			const r = design(THEME_DSL_BY_LEVEL.heichal);
			ok(r.ok, JSON.stringify(r.errors));
			eq(r.values["title.fontSize"], "64px");
		}),
		check("kodesh solves narrower than heichal", () => {
			const h = design(THEME_DSL_BY_LEVEL.heichal);
			const k = design(THEME_DSL_BY_LEVEL.kodesh);
			ok(h.ok && k.ok);
			const num = (v) => parseFloat(String(v).replace("em", ""));
			ok(num(k.values["body.maxWidth"]) < num(h.values["body.maxWidth"]), "kodesh measure narrower");
		}),
		check("kodesh chrome.count is 0", () => {
			const r = design(THEME_DSL_BY_LEVEL.kodesh);
			ok(r.ok, JSON.stringify(r.errors));
			eq(r.values["chrome.count"], "0");
		}),
		check("tokens carry colors and chrome lists", () => {
			for (const [level, t] of Object.entries(TOKENS)) {
				ok(/^#[0-9a-f]{6}$/i.test(t.background), `${level} background hex`);
				ok(Array.isArray(t.chrome), `${level} chrome list`);
			}
			ok(TOKENS.kodesh.chrome.length < TOKENS.shaar.chrome.length, "kodesh less chrome than shaar");
		}),
		check("themeCssVars emits custom properties", () => {
			const css = themeCssVars("heichal");
			ok(css.includes('--mikdash-bg: #f7f1e3'), css);
			ok(css.includes('[data-mikdash-level="heichal"]'), css);
		}),
	];
}
