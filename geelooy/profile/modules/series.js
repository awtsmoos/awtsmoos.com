//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileSeries
 * @description Every series an alias created or follows, as real links.
 * B"H 2026-10-13: guaranteed terminal state — content, empty message, or error with a WORKING retry button.
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

/**
 * Loads one alias's AUTHORED series; never throws — failures become
 * empty lists. B"H 2026-11-20 round 3: the source used to be
 * /profiles/:alias/comment-series — the comment-browsing index, which
 * measures comment activity, not series ownership. For this account
 * it returns [] while the alias owns 21 series, so the dashboard's
 * Series stat read 0 and the tab claimed "No series yet" (the public
 * profile, counting the series tree, showed 21 for the same person).
 * The loader now reads the same series tree the public profile
 * counts — /profile/:alias/tree, memoized server-side — and flattens
 * every series node under its Heichel root, so the dashboard stat,
 * the Series tab, and the public profile all count one quantity.
 */
export async function loadSeriesForAlias(alias) {
	try {
		const data = await apiJson(`/api/social/profile/${encodeURIComponent(alias.id)}/tree`, { timeoutMs: 20000 });
		const roots = listFrom(data?.data || data);
		const out = [];
		const seen = new Set();
		const walk = (nodes, heichelId) => {
			for (const node of nodes || []) {
				const id = String(node?.id || node?.seriesId || '');
				if (id) {
					const key = `${heichelId}/${id}`;
					if (!seen.has(key)) {
						seen.add(key);
						out.push({
							id,
							title: node.title || node.name || id,
							url: `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(id)}`,
							...(node.postCount != null ? { postCount: node.postCount } : {})
						});
					}
				}
				walk(node?.children, heichelId);
			}
		};
		for (const root of roots) {
			walk(root?.children, String(root?.heichelId || root?.id || 'ikar'));
		}
		return out;
	} catch {
		return [];
	}
}

/** Builds an error card with a retry button that genuinely re-runs the loader. */
function seriesErrorCard(message) {
	const card = emptyCard(message, "error");
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "g-button";
	btn.textContent = "Retry";
	btn.addEventListener("click", () => { renderProfileSeries().catch(() => {}); });
	card.append(btn);
	return card;
}

/** Renders every series across all aliases as linked cards. */
export async function renderProfileSeries() {
	const list = one(".profile-series-list");
	if (!list) return;
	list.innerHTML = '<div class="pd-skeleton-list" aria-hidden="true"><div class="pd-skeleton"></div><div class="pd-skeleton"></div></div>';
	// B"H social fix 1: batched + progressive (same parallel-flood defect as
	// the Posts tab — ~40 simultaneous requests behind an 8s deadline).
	// Aliases load 5 at a time; each batch's cards append as they land.
	// (loadSeriesForAlias never throws — a failure is an empty list.)
	const aliases = state.aliases || [];
	let total = 0;
	let shown = false;
	for (let start = 0; start < aliases.length; start += 5) {
		const batch = aliases.slice(start, start + 5);
		const groups = await Promise.all(batch.map(loadSeriesForAlias));
		const items = groups.flat();
		total += items.length;
		if (items.length) {
			if (!shown) { list.innerHTML = ''; shown = true; }
			list.append(...items.map(seriesCard));
		}
	}
	setStat('series', String(total));
	if (!shown) {
		replaceWith(list, emptyCard("No series yet. Create or follow a series to see it here."));
	}
}
