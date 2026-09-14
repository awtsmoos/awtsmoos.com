//B"H
//Boruch Hashem
//Blessed be He

/** @module BuilderTemplateScript @description Supplies tiny progressive enhancement for premium starters. */
function premiumScript() {
	return `//B"H
//Boruch Hashem
//Blessed be He

/** Marks the premium starter ready and keeps the copyright year current. */
document.documentElement.dataset.awtsmoosSite = "ready";

const year = document.querySelector("[data-year]");
if (year) {
	year.textContent = String(new Date().getFullYear());
}

/** Reveals the viral Remix road only from a real public Awtsmoos Site. */
const remix = document.querySelector("[data-awtsmoos-remix]");
if (remix && location.pathname.startsWith("/sites/")) {
	const builder = new URL("/drive/", location.origin);
	builder.searchParams.set("remix", location.href);
	remix.href = builder.toString();
	remix.hidden = false;
}

for (const link of document.querySelectorAll('a[href^="#"]')) {
	link.addEventListener("click", event => {
		const target = document.querySelector(link.getAttribute("href"));
		if (!target) return;
		event.preventDefault();
		target.scrollIntoView({ behavior: "smooth", block: "start" });
	});
}
`;
}

module.exports = { premiumScript };
