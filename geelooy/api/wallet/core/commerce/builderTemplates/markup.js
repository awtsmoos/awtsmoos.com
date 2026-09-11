//B"H
//Boruch Hashem
//Blessed be He

/** @module BuilderTemplateMarkup @description Generates semantic premium starter HTML without external dependencies. */
function premiumMarkup(profile, name) {
	const cards = profile.cards.map((card, index) => `
		<article class="feature">
			<span>0${index + 1}</span>
			<h3>${card}</h3>
			<p>Designed to make the next decision easier while keeping every source file yours.</p>
		</article>`).join("");
	const stats = profile.stats.map(stat => `<strong>${stat}</strong>`).join("");
	return `<!--B"H
Boruch Hashem
Blessed be He
-->
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="${name} — ${profile.kind} website">
	<title>${name}</title>
	<link rel="stylesheet" href="styles.css">
</head>
<body>
	<header class="nav">
		<a class="brand" href="#top">${name}</a>
		<nav aria-label="Primary"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a></nav>
		<a class="nav-cta" href="#pricing">Get started</a>
	</header>
	<main id="top">
		<section class="hero">
			<p class="eyebrow">${profile.eyebrow}</p>
			<h1>${profile.heading}</h1>
			<p class="lead">${profile.lead}</p>
			<div class="hero-actions"><a class="button primary" href="#pricing">${profile.cta}</a><a class="button ghost" href="#features">See the system</a></div>
			<div class="stats" aria-label="Highlights">${stats}</div>
		</section>
		<section class="section" id="features">
			<p class="eyebrow">Why it converts</p>
			<h2>Every section earns its place.</h2>
			<div class="feature-grid">${cards}</div>
		</section>
		<section class="split section">
			<div><p class="eyebrow">Built for trust</p><h2>Clear enough to understand. Strong enough to remember.</h2></div>
			<blockquote>“The best website removes uncertainty before asking for commitment.”<cite>— ${name}</cite></blockquote>
		</section>
		<section class="pricing section" id="pricing">
			<div><p class="eyebrow">Simple offer</p><h2>One clear next step.</h2><p>Replace this example offer with the real value your business delivers.</p></div>
			<article class="price-card"><span>Most popular</span><strong>$49</strong><p>Example monthly plan</p><ul><li>Primary outcome</li><li>Priority benefit</li><li>Human support</li></ul><a class="button primary" href="mailto:hello@example.com">Choose this plan</a></article>
		</section>
		<section class="section" id="faq"><p class="eyebrow">FAQ</p><h2>Resolve the last objections.</h2><details open><summary>Can I edit everything?</summary><p>Yes. This starter is ordinary semantic HTML, CSS, and JavaScript.</p></details><details><summary>Does it require a framework?</summary><p>No. There are no external libraries or build tools.</p></details></section>
		<section class="final"><p class="eyebrow">Ready when you are</p><h2>${profile.heading}</h2><a class="button primary" href="#top">${profile.cta}</a></section>
	</main>
	<footer><span>${name}</span><a data-awtsmoos-remix hidden>Built with Awtsmoos · Remix this</a><span data-year></span></footer>
	<script src="site.js"></script>
</body>
</html>
`;
}

module.exports = { premiumMarkup };
