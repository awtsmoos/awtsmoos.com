// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes the public alias shell from focused identity and social modules.
 * @description
 * The Awtsmoos renews the center while many pathways come and go;
 * Awtsmoos.com keeps one identity spine, then lets each deeper chamber glow.
 */
import { el } from "./dom.js";
import {
	profileState,
	setTab,
	toggleDrawer,
	setDrawer,
	setSocialExtras
} from "./state.js";
import {
	listFollows,
	listFollowers,
	loadGraph,
	loadRecommendations
} from "./api.js";
import { topbar } from "./components/topbar.js";
import { hero } from "./components/hero.js";
import { stats } from "./components/stats.js";
import { tabs } from "./components/tabs.js";
import { bottomNav } from "./components/bottomNav.js";
import { drawer } from "./components/drawer.js";
import { followButton } from "./components/followButton.js";
import { profileSection } from "./components/profileSections.js";

/** @param {HTMLElement} container Root alias mount. */
export function render(container) {
	const profile = profileState.profile;
	const repaint = () => render(container);
	const root = el("div", {
		className: `profile-app ${profile.activeTemplate?.className || ""} ${profileState.drawerOpen ? "drawer-open" : ""}`
	});
	root.append(
		drawer(profileState.drawerOpen, () => closeDrawer(repaint)),
		topbar(() => openDrawer(repaint)),
		profileMain(profile, repaint),
		bottomNav(profileState.activeTab, tab => navigate(tab, repaint))
	);
	container.replaceChildren(root);
	if (!profileState.socialExtrasLoaded) {
		loadSocialExtras(profile).then(repaint).catch(() => setSocialExtras());
	}
}

function profileMain(profile, repaint) {
	return el("main", { className: "profile-main" }, [
		hero(profile),
		socialHeader(profile, repaint),
		stats(profile),
		tabs(profileState.activeTab, tab => navigate(tab, repaint)),
		profileSection(profile, repaint)
	]);
}

function socialHeader(profile, repaint) {
	return el("section", { className: "profile-social-header" }, [
		followButton({
			profile,
			viewerAliasId: profileState.viewerAliasId,
			follows: profileState.viewerFollows,
			onChange: () => refreshSocialExtras(profile, repaint)
		}),
		socialPill(`${profileState.followers.length} followers`, () => navigate("network", repaint)),
		socialPill(`${profileState.profileFollows.length} following`, () => navigate("network", repaint))
	]);
}

function socialPill(text, onClick) {
	return el("button", {
		className: "profile-social-pill",
		text,
		attrs: { type: "button" },
		on: { click: onClick }
	});
}

async function refreshSocialExtras(profile, repaint) {
	profileState.socialExtrasLoaded = false;
	await loadSocialExtras(profile);
	repaint();
}

async function loadSocialExtras(profile) {
	const aliasId = profile.alias.id;
	const viewer = profileState.viewerAliasId;
	const [viewerFollows, profileFollows, followers, graph, recommendations] = await Promise.all([
		viewer ? listFollows(viewer).catch(() => []) : Promise.resolve([]),
		listFollows(aliasId).catch(() => []),
		listFollowers("alias", aliasId).catch(() => []),
		loadGraph(aliasId).catch(() => null),
		loadRecommendations(aliasId).catch(() => [])
	]);
	setSocialExtras({ viewerFollows, profileFollows, followers, graph, recommendations });
}

function navigate(tab, repaint) {
	setTab(tab);
	repaint();
	requestAnimationFrame(() => document.querySelector(".profile-deep-section, .profile-contribution-archive, .profile-about-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function closeDrawer(repaint) {
	setDrawer(false);
	repaint();
}

function openDrawer(repaint) {
	toggleDrawer();
	repaint();
}
