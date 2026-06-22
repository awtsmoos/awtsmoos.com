// B"H
/**
 * @module ProfileRender
 * @description
 * Chapter 444: The profile becomes a social courtyard. Posts and comments are
 * still here, but now memory, follows, graph, recommendations, and activity
 * stand together as one navigable identity hub.
 */

import { el, emptyCard, clean } from "./dom.js";
import { profileState, setTab, toggleDrawer, setDrawer, setSocialExtras } from "./state.js";
import { listFollows, listFollowers, loadGraph, loadRecommendations } from "./api.js";
import { topbar } from "./components/topbar.js";
import { hero } from "./components/hero.js";
import { stats } from "./components/stats.js";
import { tabs } from "./components/tabs.js";
import { postCard } from "./components/postCard.js";
import { commentCard } from "./components/commentCard.js";
import { heichelCard } from "./components/heichelCard.js";
import { treeCard } from "./components/treeCard.js";
import { historyCard } from "./components/historyCard.js";
import { bottomNav } from "./components/bottomNav.js";
import { drawer } from "./components/drawer.js";
import { followButton } from "./components/followButton.js";
import { activityFeed } from "./components/activityFeed.js";
import { recommendations } from "./components/recommendations.js";
import { graphPreview } from "./components/graphPreview.js";
import { continueReading } from "./components/continueReading.js";

function list(items = [], maker, empty) {
    const section = el("section", { className: "profile-card-list" });
    if (!items.length) section.appendChild(emptyCard(empty));
    items.forEach(item => section.appendChild(maker(item)));
    return section;
}

function followCard(item) {
    const href = item.type === "alias" ? `/@${encodeURIComponent(item.id)}` : item.type === "heichel" ? `/heichelos/${encodeURIComponent(item.id)}` : "#";
    return el("a", { className: "profile-follow-card", html: `<small>${clean(item.type)}</small><h3>${clean(item.id)}</h3><p>${item.followedAt ? new Date(item.followedAt).toLocaleString() : "Follower connection"}</p>`, attrs: { href } });
}

function followerCard(aliasId) {
    return el("a", { className: "profile-follow-card", html: `<small>alias</small><h3>@${clean(aliasId)}</h3><p>Follows this profile</p>`, attrs: { href: `/@${encodeURIComponent(aliasId)}` } });
}

function socialHeader(profile, repaint) {
    const reloadFollows = async () => {
        if (!profileState.viewerAliasId) return;
        const follows = await listFollows(profileState.viewerAliasId).catch(() => []);
        const followers = await listFollowers("alias", profile.alias.id).catch(() => []);
        setSocialExtras({ follows, followers });
        repaint();
    };
    return el("section", { className: "profile-social-header" }, [
        followButton({ profile, viewerAliasId: profileState.viewerAliasId, follows: profileState.follows, onChange: reloadFollows }),
        el("a", { className: "profile-social-pill", text: `${profileState.followers.length} followers`, attrs: { href: "#followers" }, on: { click: event => { event.preventDefault(); setTab("followers"); repaint(); } } }),
        el("a", { className: "profile-social-pill", text: `${profileState.follows.length} following`, attrs: { href: "#following" }, on: { click: event => { event.preventDefault(); setTab("following"); repaint(); } } })
    ]);
}

function dashboard(profile, repaint) {
    return el("section", { className: "profile-dashboard" }, [
        continueReading(profile.dashboard?.continueReading || profile.history || []),
        recommendations(profileState.recommendations.length ? profileState.recommendations : (profile.dashboard?.recommendations || [])),
        graphPreview(profileState.graph || { nodes: [], edges: [] }),
        el("button", { className: "profile-refresh-social", text: "Refresh social panels", attrs: { type: "button" }, on: { click: async () => { await loadSocialExtras(profile); repaint(); } } })
    ]);
}

function tabBody(profile, repaint) {
    const map = {
        posts: () => list(profile.posts, postCard, "No posts yet."),
        comments: () => list(profile.comments, commentCard, "No comments yet."),
        heichelos: () => list(profile.heichelos, heichelCard, "No Heichelos yet."),
        tree: () => treeCard(profile.tree || profile.seriesTree || []),
        activity: () => activityFeed(profile.activity || []),
        history: () => list(profile.history || profile.dashboard?.continueReading || [], historyCard, "No view history yet."),
        graph: () => graphPreview(profileState.graph || { nodes: [], edges: [] }),
        following: () => list(profileState.follows, followCard, "Not following anything yet."),
        followers: () => list(profileState.followers, followerCard, "No followers yet."),
        recommendations: () => recommendations(profileState.recommendations)
    };
    return (map[profileState.activeTab] || map.posts)(repaint);
}

async function loadSocialExtras(profile) {
    const aliasId = profile.alias.id;
    const viewer = profileState.viewerAliasId;
    const [follows, followers, graph, recs] = await Promise.all([
        viewer ? listFollows(viewer).catch(() => []) : Promise.resolve([]),
        listFollowers("alias", aliasId).catch(() => []),
        loadGraph(aliasId).catch(() => null),
        loadRecommendations(aliasId).catch(() => [])
    ]);
    setSocialExtras({ follows, followers, graph, recommendations: recs });
}

export function render(container) {
    const profile = profileState.profile;
    const root = el("div", { className: `profile-app ${profile.activeTemplate?.className || ""} ${profileState.drawerOpen ? "drawer-open" : ""}` });
    const repaint = () => render(container);
    const close = () => { setDrawer(false); repaint(); };
    const body = el("main", { className: "profile-main" }, [
        hero(profile),
        socialHeader(profile, repaint),
        stats(profile),
        dashboard(profile, repaint),
        tabs(profileState.activeTab, tab => { setTab(tab); repaint(); }),
        tabBody(profile, repaint)
    ]);
    root.append(drawer(profileState.drawerOpen, close), topbar(() => { toggleDrawer(); repaint(); }), body, bottomNav());
    container.replaceChildren(root);
    if (!profileState.graph && !root.dataset.loadingExtras) {
        root.dataset.loadingExtras = "yes";
        loadSocialExtras(profile).then(() => render(container)).catch(() => {});
    }
}
