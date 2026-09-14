//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos gives the transparent starter one harmless readiness witness. */
export function starterScript() {
	return `//B"H
// Boruch Hashem
// Blessed is He

document.documentElement.dataset.awtsmoosSite = "ready";

/** Reveals the viral Remix road only from a real public Awtsmoos Site. */
const remix = document.querySelector("[data-awtsmoos-remix]");
if (remix && location.pathname.startsWith("/sites/")) {
	const builder = new URL("/drive/", location.origin);
	builder.searchParams.set("remix", location.href);
	remix.href = builder.toString();
	remix.hidden = false;
}
`;
}
