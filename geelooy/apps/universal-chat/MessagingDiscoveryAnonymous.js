// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds an intentional anonymous Discover starting point from existing public Awtsmoos surfaces without inventing profile history.
 * @description The Awtsmoos offers infinite roads while Ploni carries no durable behavioral shadow; Awtsmoos.com therefore starts with public Torah, Heichelos,
 * and a truthful privacy explanation, letting curiosity move first without silently converting a browsing session into an account dossier.
 */

/** Creates the anonymous Discover chamber and delegates Public Torah navigation to the existing rail. */
export function anonymousDiscoveryView() {
	const section = document.createElement("section");
	section.className = "messaging-discovery-anonymous";
	const header = document.createElement("header");
	header.className = "messaging-discovery-hero";
	const eyebrow = document.createElement("span");
	eyebrow.className = "messaging-card-eyebrow";
	eyebrow.textContent = "Discover as Ploni";
	const title = document.createElement("h2");
	title.textContent = "Start somewhere meaningful";
	const body = document.createElement("p");
	body.textContent = "Explore publicly without creating permanent account history. This session may remember short-lived interests only to make the current visit more useful.";
	header.append(eyebrow, title, body);
	const grid = document.createElement("div");
	grid.className = "messaging-discovery-start-grid";
	grid.append(
		startCard("Torah", "Public Torah", "Search privately, choose trusted sources, then discuss only selected source cards.", publicTorahButton()),
		startCard("Communities", "Explore Heichelos", "Enter authored Torah, posts, series, and community learning spaces across Awtsmoos.", routeLink("Browse Heichelos", "/heichelos/")),
		startCard("Privacy", "Stay anonymous", "No private chats, friend graph, or permanent activity profile is created until you deliberately sign in and choose an alias.", null)
	);
	section.append(header, grid);
	return section;
}

function startCard(kickerText, titleText, bodyText, action) {
	const card = document.createElement("article");
	card.className = "messaging-discovery-start-card";
	const kicker = document.createElement("small");
	kicker.textContent = kickerText;
	const title = document.createElement("strong");
	title.textContent = titleText;
	const body = document.createElement("p");
	body.textContent = bodyText;
	card.append(kicker, title, body);
	if (action) {
		card.appendChild(action);
	}
	return card;
}

function publicTorahButton() {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = "Open Public Torah";
	button.addEventListener("click", () => {
		document.querySelector('[data-section="public"]')?.click();
	});
	return button;
}

function routeLink(label, href) {
	const link = document.createElement("a");
	link.className = "messaging-discovery-link";
	link.href = href;
	link.textContent = label;
	return link;
}
