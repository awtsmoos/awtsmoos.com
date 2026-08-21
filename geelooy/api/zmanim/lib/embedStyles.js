//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond stylesheet and theme while every embedded day receives a lightweight visible garment;
 * Awtsmoos.com keeps this static server CSS self-contained, responsive, and script-free so semantic zmanim can travel without runtime burden.
 */

/** Return the complete self-contained stylesheet for server-rendered Zmanim embeds. */
function embedStyles() {
	return `
:root {
	color-scheme: dark;
	--bg: #06100d;
	--panel: #0d1d18;
	--panel-2: #122720;
	--ink: #eef9f4;
	--soft: #9dbbb0;
	--muted: #759489;
	--accent: #7ce7c5;
	--solar: #ffd58a;
	--line: rgba(173, 224, 205, .16);
	font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
body {
	margin: 0;
	background: radial-gradient(circle at 12% -20%, rgba(76, 205, 163, .12), transparent 35rem), var(--bg);
	color: var(--ink);
	font-size: 15px;
	line-height: 1.45;
}
main { width: min(100%, 880px); margin: 0 auto; padding: 12px; }
header, section, footer {
	border: 1px solid var(--line);
	border-radius: 16px;
	background: linear-gradient(145deg, rgba(255,255,255,.035), rgba(255,255,255,.012));
}
header { padding: 16px; }
h1, h2, p { margin: 0; }
h1 { font-size: clamp(1.2rem, 5vw, 1.75rem); letter-spacing: -.025em; }
h2 { margin-bottom: 10px; font-size: .82rem; letter-spacing: .08em; text-transform: uppercase; color: var(--soft); }
.meta { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 6px; color: var(--soft); font-size: .78rem; }
.badge { display: inline-flex; margin-top: 12px; padding: 5px 8px; border: 1px solid var(--line); border-radius: 999px; color: var(--accent); font-size: .68rem; }
section { margin-top: 10px; padding: 13px; }
.zman-list { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.zman-list li { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 10px; align-items: baseline; padding: 8px 9px; border-radius: 10px; background: rgba(255,255,255,.025); }
.zman-list strong { font-size: .78rem; }
.zman-list time { color: var(--solar); font-weight: 800; font-variant-numeric: tabular-nums; }
.zman-list small { grid-column: 1 / -1; color: var(--muted); font-size: .66rem; }
.next-zman { display: grid; gap: 3px; padding: 12px; border: 1px solid rgba(255,213,138,.22); border-radius: 12px; background: rgba(255,213,138,.055); }
.next-zman time { color: var(--solar); font-size: 1.25rem; font-weight: 850; }
.timeline { display: flex; gap: 6px; overflow-x: auto; margin: 0; padding: 0 0 4px; list-style: none; scroll-snap-type: x proximity; }
.timeline li { min-width: 112px; padding: 8px; border: 1px solid var(--line); border-radius: 10px; scroll-snap-align: start; }
.timeline strong, .timeline span { display: block; font-size: .68rem; }
.timeline span { margin-top: 2px; color: var(--solar); font-weight: 800; }
.sky-link { display: flex; justify-content: space-between; gap: 12px; align-items: center; color: inherit; text-decoration: none; }
.sky-link b { color: var(--accent); }
.warning { color: var(--soft); font-size: .7rem; }
footer { margin-top: 10px; padding: 11px 13px; color: var(--muted); font-size: .67rem; }
.density-compact main { padding: 7px; }
.density-compact section { margin-top: 6px; padding: 9px; }
.theme-light {
	color-scheme: light;
	--bg: #edf6f1;
	--panel: #f8fcfa;
	--panel-2: #fff;
	--ink: #10241e;
	--soft: #385a4f;
	--muted: #617d73;
	--accent: #096b53;
	--solar: #8a5400;
	--line: rgba(27,91,72,.16);
}
@media (prefers-color-scheme: light) {
	.theme-system {
		color-scheme: light;
		--bg: #edf6f1; --ink: #10241e; --soft: #385a4f; --muted: #617d73;
		--accent: #096b53; --solar: #8a5400; --line: rgba(27,91,72,.16);
	}
}
@media (max-width: 460px) {
	main { padding: 7px; }
	.zman-list li { grid-template-columns: 1fr auto; padding: 8px; }
}
`;
}

module.exports = {
	embedStyles
};
