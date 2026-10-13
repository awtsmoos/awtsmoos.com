//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileSeries
 * @description Every series an alias created or follows, as real links.
 */
import { one, replaceWith, cleanText, setStat } from "./dom.js";
import { emptyCard } from "./cards.js";
import { apiJson, listFrom } from "./api.js";
import { state } from "./state.js";

/** Builds one series card linking to the live series. */
function seriesCard(series = {}) {
	const id = cleanText(series.id || series.seriesId || "");
	const title = cleanText(series.title || series.name || id || "Untitled series");
	const url = series.url || (id ? `/heichelos/ikar/series/${encodeURIComponent(id)}` : "");
	const card = document.createElement("article");
	card.className = "social-series-card";
	const link = document.createElement("a");
	link.className = "social-series-link";
	if (url) link.href = url;
	const heading = document.createElement("h3");
	heading.textContent = title;
	link.append(heading);
	card.append(link);
	const bits = [];
	if (series.postCount != null) bits.push(`${series.postCount} posts`);
	if (series.description) {
		const desc = document.createElement("p");
		desc.className = "social-series-desc";
		desc.textContent = cleanText(series.description).slice(0, 160);
		card.append(desc);
	}
	if (bits.length) {
		const meta = document.createElement("small");
		meta.className = "social-series-meta";
		meta.textContent = bits.join(" · ");
		card.append(meta);
	}
	return card;
}

async function loadSeriesForAlias(alias) {
	try {
		const data = await apiJson(`/api/social/profiles/${encodeURIComponent(alias.id)}/comment-series`, { timeoutMs: 9000 });
		return listFrom(data?.data || data);
	} catch {
		return [];
	}
}

/** Renders every series across all aliases as linked cards. */
export async function renderProfileSeries() {
	const list = one(".profile-series-list");
	if (!list) return;
	list.innerHTML = '<div class="pd-skeleton-list" aria-hidden="true"><div class="pd-skeleton"></div><div class="pd-skeleton"></div></div>';
	let groups;
	try {
		groups = await Promise.race([
			Promise.all(state.aliases.map(loadSeriesForAlias)),
			new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000))
		]);
	} catch {
		replaceWith(list, emptyCard("Series could not load. Tap the tab again to retry.", "error"));
		return;
	}
	const items = groups.flat();
	setStat('series', String(items.length));
	if (!items.length) {
		replaceWith(list, emptyCard("No series yet. Create or follow a series to see it here."));
		return;
	}
	replaceWith(list, ...items.map(seriesCard));
}
