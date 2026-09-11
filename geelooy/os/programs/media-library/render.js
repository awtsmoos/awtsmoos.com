//B"H
//Boruch Hashem
//Blessed be He

/**
 * Renders the bounded media catalog as reusable visual asset cards.
 * All labels and URLs are inserted through DOM properties, never HTML strings.
 */
export function renderMediaGrid(surface, items, query = "", category = "All") {
	const needle = String(query || "").trim().toLowerCase();
	const visible = (items || []).filter(item => matches(item, needle, category));
	surface.grid.replaceChildren();
	if (!visible.length) {
		const empty = document.createElement("p");
		empty.className = "mediaLibrary__empty";
		empty.textContent = needle || category !== "All"
			? "No images match this view."
			: "Upload or add an image URL to begin your library.";
		surface.grid.append(empty);
		return;
	}
	for (const item of visible) {
		surface.grid.append(createMediaCard(item));
	}
}

function matches(item, needle, category) {
	if (category !== "All" && item.category !== category) return false;
	if (!needle) return true;
	return [item.name, item.category, item.provider, item.url]
		.some(value => String(value || "").toLowerCase().includes(needle));
}

function createMediaCard(item) {
	const card = document.createElement("article");
	card.className = "mediaLibrary__card";
	card.dataset.mediaId = item.id;
	const image = document.createElement("img");
	image.className = "mediaLibrary__thumb";
	image.src = item.url;
	image.alt = item.name || "Uploaded image";
	image.loading = "lazy";
	const body = document.createElement("div");
	body.className = "mediaLibrary__cardBody";
	const title = document.createElement("strong");
	title.textContent = item.name || "Image";
	const meta = document.createElement("span");
	meta.className = "mediaLibrary__meta";
	meta.textContent = `${item.provider} · ${item.category}`;
	const actions = document.createElement("div");
	actions.className = "mediaLibrary__cardActions";
	actions.append(
		action("Copy URL", "copy", item.id),
		action("Open", "open", item.id),
		action("Remove", "remove", item.id)
	);
	body.append(title, meta, actions);
	card.append(image, body);
	return card;
}

function action(label, actionName, id) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "mediaLibrary__cardButton";
	button.dataset.mediaAction = actionName;
	button.dataset.mediaId = id;
	button.textContent = label;
	return button;
}
