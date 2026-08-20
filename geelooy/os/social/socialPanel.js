// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Live data and interaction orchestration for the Geelooy OS Social Command Center.
 * @description
 * The Awtsmoos lets the static chamber and living signal remain distinct;
 * Awtsmoos.com keeps feed, mount, search, and messaging motion small enough to inspect.
 */
import { ensureSocialPanelStyles } from "./styles.js";
import {
	currentAlias,
	feedPreview,
	inlineMessaging,
	json,
	mountCard,
	status,
	thanksFallback
} from "./localSocialWidgets.js";
import {
	socialPanelShell,
	socialWindowTitle
} from "./socialPanelShell.js";

/** @param {{type?:string,os?:object}} options Social panel context. */
export function socialPanel({ type = "command", os = null } = {}) {
	ensureSocialPanelStyles();
	const alias = os?.socialMount?.preference?.get?.().aliasId || currentAlias();
	const box = socialPanelShell(alias);
	fillSurface(type, box.querySelector("[data-social-surface]"), alias, os, box);
	bindSearch(box, alias);
	return box;
}

/** @param {object} os Live OS facade. @param {string} type Social window mode. */
export async function openSocialWindow(os, type = "command") {
	return os.addWindow({
		title: socialWindowTitle(type),
		content: socialPanel({ type, os }),
		os
	});
}

async function fillSurface(type, surface, alias, os, panel) {
	if (type === "message") {
		surface.append(inlineMessaging({ aliases: [alias].filter(Boolean), defaultAlias: alias }));
		return;
	}
	if (type === "thanks") {
		surface.append(thanksFallback());
		return;
	}
	appendMount(surface, os, panel);
	if (!alias) {
		surface.append(status("Choose an alias to load live social activity."));
		return;
	}
	await appendFeed(surface);
}

function appendMount(surface, os, panel) {
	if (!os?.socialMount) {
		return;
	}
	const state = os.socialMount.preference.get();
	surface.append(mountCard({
		...state,
		onToggle: () => toggleMount(os, panel)
	}));
}

async function appendFeed(surface) {
	const loading = status("Loading recent social activity…");
	surface.append(loading);
	try {
		const data = await json("/api/social/feed/home?limit=6");
		loading.replaceWith(feedPreview(feedItems(data)));
	} catch (error) {
		loading.replaceWith(status(error.message, "error"));
	}
}

function toggleMount(os, panel) {
	const preference = os.socialMount.preference;
	const state = preference.get();
	const alias = state.aliasId || currentAlias();
	if (!alias) {
		os.taskbar?.notify?.("Choose an alias before mounting social space.", "warning");
		return;
	}
	preference.setAlias(alias);
	preference.setEnabled(!state.enabled);
	os.socialMount.sync();
	panel.replaceWith(socialPanel({ os }));
}

function bindSearch(box, alias) {
	box.querySelector("form").addEventListener("submit", event => {
		event.preventDefault();
		const query = event.currentTarget.q.value.trim();
		if (!query) {
			return;
		}
		location.href = `/email?alias=${encodeURIComponent(alias)}&search=${encodeURIComponent(query)}`;
	});
}

function feedItems(data) {
	if (Array.isArray(data)) {
		return data;
	}
	return data?.items || data?.feed || data?.results || [];
}
