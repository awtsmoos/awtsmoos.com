//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos reveals a readable semantic page instead of a proprietary or minified artifact. */
export function starterMarkup({ label, heading, lead }) {
	return `<!--B"H
Boruch Hashem
Blessed is He
-->
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>{{SITE_NAME}}</title>
	<link rel="stylesheet" href="styles.css">
</head>
<body>
	<header>
		<a href="#main">{{SITE_NAME}}</a>
		<span>${label}</span>
	</header>
	<main id="main">
		<p class="eyebrow">{{SITE_NAME}}</p>
		<h1>${heading}</h1>
		<p class="lead">${lead}</p>
		<a class="button" href="#next">Begin</a>
		<section id="next">
			<h2>Built from real source</h2>
			<p>Edit this HTML, its CSS, and its JavaScript whenever the next idea arrives.</p>
		</section>
	</main>
	<script src="site.js"></script>
</body>
</html>
`;
}
