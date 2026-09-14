//B"H
//Boruch Hashem
//Blessed be He

/** @module BuilderTemplateStyle @description Generates polished responsive CSS for premium starter source. */
function premiumStyle() {
	return `/*B"H
Boruch Hashem
Blessed be He
*/
:root {
	color-scheme: light;
	--ink: #121521;
	--muted: #667085;
	--paper: #f7f8fb;
	--panel: #ffffff;
	--line: #e3e7ef;
	--accent: #5b4ff7;
	font: 16px/1.6 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--paper); color: var(--ink); }
a { color: inherit; }
.nav, main, footer { width: min(1120px, calc(100% - 32px)); margin-inline: auto; }
.nav { min-height: 76px; display: flex; align-items: center; gap: 24px; }
.brand { margin-right: auto; font-weight: 900; text-decoration: none; letter-spacing: -.03em; }
.nav nav { display: flex; gap: 20px; }
.nav nav a { color: var(--muted); text-decoration: none; font-weight: 700; font-size: .9rem; }
.nav-cta, .button { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; padding: 0 18px; border-radius: 999px; font-weight: 850; text-decoration: none; }
.nav-cta, .button.primary { background: var(--ink); color: white; }
.button.ghost { border: 1px solid var(--line); background: var(--panel); }
.hero { padding: clamp(72px, 12vw, 150px) 0 72px; }
.eyebrow { margin: 0 0 12px; color: var(--accent); font-size: .78rem; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
h1, h2, h3, p { margin-top: 0; }
h1 { max-width: 12ch; margin-bottom: 24px; font-size: clamp(3.4rem, 9vw, 7.4rem); line-height: .9; letter-spacing: -.075em; }
h2 { max-width: 15ch; font-size: clamp(2rem, 5vw, 4rem); line-height: 1; letter-spacing: -.055em; }
.lead { max-width: 720px; color: var(--muted); font-size: clamp(1.08rem, 2.5vw, 1.4rem); }
.hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 30px 0 50px; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; overflow: hidden; border: 1px solid var(--line); border-radius: 18px; background: var(--line); }
.stats strong { padding: 18px; background: var(--panel); font-size: .9rem; }
.section { padding: 100px 0; border-top: 1px solid var(--line); }
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 34px; }
.feature { padding: 24px; border: 1px solid var(--line); border-radius: 22px; background: var(--panel); }
.feature > span { color: var(--accent); font-weight: 900; }
.feature h3 { margin: 42px 0 8px; font-size: 1.35rem; }
.feature p, .pricing p, details p { color: var(--muted); }
.split, .pricing { display: grid; grid-template-columns: 1.2fr .8fr; gap: clamp(30px, 7vw, 90px); align-items: center; }
blockquote, .price-card { margin: 0; padding: 30px; border-radius: 24px; background: var(--ink); color: white; }
blockquote { font-size: 1.35rem; }
blockquote cite { display: block; margin-top: 18px; color: #b7bdc9; font-size: .8rem; font-style: normal; }
.price-card > span { color: #beb9ff; font-size: .75rem; font-weight: 900; text-transform: uppercase; }
.price-card > strong { display: block; margin: 8px 0; font-size: 3rem; }
.price-card ul { padding-left: 20px; color: #d7dbe5; }
.price-card .button { width: 100%; margin-top: 12px; background: white; color: var(--ink); }
details { padding: 18px 0; border-bottom: 1px solid var(--line); }
summary { cursor: pointer; font-weight: 850; }
.final { margin: 70px 0; padding: clamp(34px, 7vw, 78px); border-radius: 30px; background: linear-gradient(135deg, #ebe9ff, #fff); }
footer { min-height: 90px; display: flex; justify-content: space-between; align-items: center; gap: 16px; border-top: 1px solid var(--line); color: var(--muted); }
footer a { min-height: 44px; display: inline-flex; align-items: center; color: var(--accent); font-weight: 800; }

@media (max-width: 760px) {
	.nav nav { display: none; }
	.stats, .feature-grid, .split, .pricing { grid-template-columns: 1fr; }
	h1 { font-size: clamp(3rem, 16vw, 5.2rem); }
	.section { padding: 72px 0; }
}
`;
}

module.exports = { premiumStyle };
