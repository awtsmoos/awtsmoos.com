//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Verifiers for the aleph-beis design principles.
 * @description Each check inspects a solved design (flat dotted-path → string
 * values, as produced by the constraint solver's valuesToObject) and reports
 * whether the design embodies that letter's principle.
 *
 * Result shape: { pass:boolean, applicable:boolean, detail:string }.
 * A check is not applicable when the design does not define the tokens the
 * principle speaks about — silence is not a violation.
 */

import { hexToRgb, contrastRatio } from "../constraints/solver.mjs";

/** "64px" -> 64, else null. */
function px(s) {
	const m = /^([0-9]*\.?[0-9]+)px$/.exec(String(s ?? "").trim());
	return m ? parseFloat(m[1]) : null;
}

/** Plain number string -> number, else null. */
function num(s) {
	const t = String(s ?? "").trim();
	if (/^[0-9]*\.?[0-9]+$/.test(t)) return parseFloat(t);
	return null;
}

/** "#rrggbb"/"#rgb" -> {r,g,b}, else null. */
function color(s) {
	const t = String(s ?? "").trim();
	if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(t)) return hexToRgb(t);
	return null;
}

/**
 * Solved string/keyword token -> plain word. The solver serializes strings
 * with JSON quotes ("on") and keywords bare (auto); strip quotes so both
 * compare uniformly.
 */
function str(s) {
	const t = String(s ?? "").trim();
	const m = /^"(.*)"$/.exec(t);
	return m ? m[1] : t;
}

/** WCAG contrast between two token colors, or null when unavailable. */
function contrastOf(v, fgKey, bgKey) {
	const fg = color(v[fgKey]);
	const bg = color(v[bgKey]);
	if (!fg || !bg) return null;
	return contrastRatio(fg, bg);
}

function na(letter, why) {
	return { pass: true, applicable: false, detail: `${letter}: not applicable — ${why}` };
}
function ok(letter, detail) {
	return { pass: true, applicable: true, detail: `${letter}: ${detail}` };
}
function fail(letter, detail) {
	return { pass: false, applicable: true, detail: `${letter}: ${detail}` };
}

/**
 * The 22 verifiers, keyed by letter key. Each mirrors the DSL constraints
 * in letters.mjs, evaluated against concrete solved values.
 */
export const CHECKS = {
	aleph(v) {
		const t = px(v["title.fontSize"]);
		const s = px(v["section.fontSize"]);
		const b = px(v["body.fontSize"]);
		if (t === null || s === null || b === null)
			return na("aleph", "title/section/body font sizes not all defined");
		if (t > s && s > b) return ok("aleph", `unity holds: ${t}px > ${s}px > ${b}px`);
		return fail("aleph", `hierarchy broken: title ${t}px, section ${s}px, body ${b}px`);
	},

	beis(v) {
		const mw = px(v["container.maxWidth"]);
		const pad = px(v["container.padding"]);
		if (mw === null && pad === null) return na("beis", "no container tokens defined");
		if (mw !== null && (mw < 280 || mw > 1280))
			return fail("beis", `container.maxWidth ${mw}px outside 280–1280px dwelling`);
		if (pad !== null && pad < 12)
			return fail("beis", `container.padding ${pad}px below 12px — the house has no walls`);
		return ok("beis", "content dwells in a bounded, padded container");
	},

	gimmel(v) {
		const lh = px(v["body.lineHeight"]);
		const fs = px(v["body.fontSize"]);
		const sp = px(v["section.spacing"]);
		if (lh === null || fs === null) return na("gimmel", "body line-height/font-size not defined");
		if (lh < 1.6 * fs - 0.01)
			return fail("gimmel", `line-height ${lh}px < 1.6 × ${fs}px — cramped, not generous`);
		if (sp !== null && sp < 24)
			return fail("gimmel", `section.spacing ${sp}px below 24px`);
		return ok("gimmel", `generous: line-height ${lh}px ≥ 1.6 × ${fs}px`);
	},

	daled(v) {
		const fv = str(v["focus.visible"]);
		const mt = px(v["interactive.minTouch"]);
		if (!fv && mt === null) return na("daled", "no interactivity tokens defined");
		if (fv && fv !== "on") return fail("daled", `focus.visible is '${fv}', not 'on' — a door is shut`);
		if (mt !== null && mt < 44)
			return fail("daled", `interactive.minTouch ${mt}px below 44px — the door is too narrow`);
		return ok("daled", "every door opens: focus visible, targets ≥ 44px");
	},

	hei(v) {
		const cb = contrastOf(v, "body.color", "body.background");
		const ct = contrastOf(v, "title.color", "title.background");
		if (cb === null && ct === null) return na("hei", "no color tokens defined");
		if (cb !== null && cb < 4.5)
			return fail("hei", `body contrast ${cb.toFixed(2)}:1 below 4.5:1 — words are hidden`);
		if (ct !== null && ct < 7.0)
			return fail("hei", `title contrast ${ct.toFixed(2)}:1 below 7:1`);
		return ok("hei", "all revealed: body " + (cb === null ? "n/a" : cb.toFixed(2) + ":1"));
	},

	vav(v) {
		const unit = px(v["space.unit"]);
		const sec = px(v["section.spacing"]);
		const pad = px(v["container.padding"]);
		if (unit === null) return na("vav", "space.unit not defined");
		const eps = 0.01;
		if (sec !== null && Math.abs(sec - 3 * unit) > eps)
			return fail("vav", `section.spacing ${sec}px ≠ 3 × unit (${unit}px) — rhythm broken`);
		if (pad !== null && Math.abs(pad - 2 * unit) > eps)
			return fail("vav", `container.padding ${pad}px ≠ 2 × unit (${unit}px) — rhythm broken`);
		if (sec === null && pad === null) return na("vav", "no spacing tokens to hook");
		return ok("vav", `one rhythm: spacing hooked to ${unit}px unit`);
	},

	zayin(v) {
		const sizes = ["title.fontSize", "section.fontSize", "body.fontSize"]
			.map((k) => [k, px(v[k])])
			.filter(([, x]) => x !== null);
		if (sizes.length === 0) return na("zayin", "no type sizes defined");
		const blurry = sizes.filter(([, x]) => Math.abs(x - Math.round(x)) > 0.001);
		if (blurry.length > 0)
			return fail("zayin", `blurry half-pixels: ${blurry.map(([k, x]) => `${k}=${x}px`).join(", ")}`);
		return ok("zayin", "sharp: all type sizes on whole pixels");
	},

	ches(v) {
		const mw = v["container.maxWidth"];
		const pad = v["container.padding"];
		if (!mw && !pad) return na("ches", "no container tokens defined");
		if (!mw) return fail("ches", "container has padding but no maxWidth — a fence with one rail");
		if (!pad) return fail("ches", "container has maxWidth but no padding — a fence with one rail");
		return ok("ches", "fenced: bounded container with padding");
	},

	tes(v) {
		const mr = str(v["motion.reduced"]);
		if (!mr) return na("tes", "motion.reduced not declared");
		if (mr !== "respect") return fail("tes", `motion.reduced is '${mr}', not 'respect'`);
		return ok("tes", "goodness: reduced motion respected");
	},

	yud(v) {
		const f = px(v["footnote.fontSize"]);
		const b = px(v["body.fontSize"]);
		if (f === null) return na("yud", "footnote.fontSize not defined");
		if (f < 12) return fail("yud", `footnote ${f}px below 12px — the small is neglected`);
		if (b !== null && f >= b)
			return fail("yud", `footnote ${f}px not humbler than body ${b}px`);
		return ok("yud", `humble and legible: footnote ${f}px`);
	},

	kaf(v) {
		const mw = px(v["layout.minWidth"]);
		if (mw === null) return na("kaf", "layout.minWidth not defined");
		if (mw > 360) return fail("kaf", `layout.minWidth ${mw}px — the palm does not receive small phones`);
		return ok("kaf", `receives all: min width ${mw}px`);
	},

	lamed(v) {
		const t = px(v["title.fontSize"]);
		const b = px(v["body.fontSize"]);
		if (t === null || b === null) return na("lamed", "title/body sizes not defined");
		if (t < 2 * b - 0.01)
			return fail("lamed", `title ${t}px < 2 × body ${b}px — does not rise above the line`);
		return ok("lamed", `aspires: title ${t}px ≥ 2 × body ${b}px`);
	},

	mem(v) {
		const fl = str(v["layout.fluid"]);
		const bh = v["body.height"];
		if (!fl && !bh) return na("mem", "no fluidity tokens defined");
		if (bh && /px$/.test(String(bh).trim()))
			return fail("mem", `body.height ${bh} is fixed — the water is dammed`);
		if (fl && fl !== "on") return fail("mem", `layout.fluid is '${fl}', not 'on'`);
		return ok("mem", "flows: no fixed heights damming the text");
	},

	nun(v) {
		const fp = str(v["footer.present"]);
		if (!fp) return na("nun", "footer.present not declared");
		if (fp !== "on") return fail("nun", `footer.present is '${fp}' — the dive never surfaces`);
		return ok("nun", "depth with return: the page surfaces in a footer");
	},

	samech(v) {
		const ff = str(v["body.fontFamily"]);
		if (!ff) return na("samech", "body.fontFamily not defined");
		if (!ff.includes(","))
			return fail("samech", "single font with no fallback — nothing to catch the fall");
		return ok("samech", `supported: fallback stack (${ff.split(",").length} faces)`);
	},

	ayin(v) {
		const ct = contrastOf(v, "title.color", "title.background");
		const cb = contrastOf(v, "body.color", "body.background");
		if (ct === null || cb === null) return na("ayin", "title/body color pairs not both defined");
		if (ct < cb - 0.01)
			return fail("ayin", `title contrast ${ct.toFixed(2)}:1 weaker than body ${cb.toFixed(2)}:1 — the eye lands wrong`);
		return ok("ayin", `the eye lands first on the title (${ct.toFixed(2)}:1)`);
	},

	pei(v) {
		const b = px(v["body.fontSize"]);
		if (b === null) return na("pei", "body.fontSize not defined");
		if (b < 16) return fail("pei", `body ${b}px below 16px — the mouth whispers`);
		return ok("pei", `speaks clearly: body ${b}px`);
	},

	tzadi(v) {
		const l = px(v["container.paddingLeft"]);
		const r = px(v["container.paddingRight"]);
		if (l === null || r === null) return na("tzadi", "left/right padding not both defined");
		if (Math.abs(l - r) > 0.01)
			return fail("tzadi", `padding lopsided: left ${l}px vs right ${r}px`);
		return ok("tzadi", `balanced: ${l}px each side`);
	},

	kuf(v) {
		const s = px(v["sacred.spacing"]);
		if (s === null) return na("kuf", "sacred.spacing not defined");
		if (s < 48) return fail("kuf", `sacred.spacing ${s}px below 48px — the holy is crowded`);
		return ok("kuf", `set apart: ${s}px around the sacred`);
	},

	reish(v) {
		const c = num(v["title.count"]);
		if (c === null) return na("reish", "title.count not declared");
		if (c !== 1) return fail("reish", `${c} titles — two heads argue`);
		return ok("reish", "one head leads: exactly one title");
	},

	shin(v) {
		const c = color(v["accent.color"]);
		if (!c) return na("shin", "accent.color not defined");
		if (!(c.r > c.b))
			return fail("shin", "accent carries no fire — blue-dominant, cold");
		return ok("shin", "fire: warm red-dominant accent");
	},

	tav(v) {
		const s = str(v["layout.shift"]);
		if (!s) return na("tav", "layout.shift not declared");
		if (s !== "none") return fail("tav", `layout.shift is '${s}' — the ground moves`);
		return ok("tav", "firm: no layout shift, the seal holds");
	},
};
