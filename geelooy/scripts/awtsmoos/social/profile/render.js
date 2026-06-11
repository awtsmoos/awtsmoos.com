// B"H
/**
 * @module ProfileRender
 * @description
 * Chapter 100: The profile page is rendered by one clean order. The drawer is
 * a controlled layer with an explicit close path, and tabs close it before they
 * repaint so mobile never shows the broken half-screen state again.
 */

import { el, emptyCard } from "./dom.js";
import { profileState, setTab, toggleDrawer, setDrawer } from "./state.js";
import { topbar } from "./components/topbar.js";
import { hero } from "./components/hero.js";
import { stats } from "./components/stats.js";
import { tabs } from "./components/tabs.js";
import { postCard } from "./components/postCard.js";
import { commentCard } from "./components/commentCard.js";
import { heichelCard } from "./components/heichelCard.js";
import { treeCard } from "./components/treeCard.js";
import { bottomNav } from "./components/bottomNav.js";
import { drawer } from "./components/drawer.js";

function list(items, maker, empty) {
    const section = el("section", { className: "profile-card-list" });
    if (!items.length) section.appendChild(emptyCard(empty));
    items.forEach(item => section.appendChild(maker(item)));
    return section;
}

function tabBody(profile) {
    const map = {
        posts: () => list(profile.posts, postCard, "No posts yet."),
        comments: () => list(profile.comments, commentCard, "No comments yet."),
        heichelos: () => list(profile.heichelos, heichelCard, "No Heichelos yet."),
        tree: () => treeCard(profile.tree || profile.seriesTree || []),
        activity: () => list(profile.activity, item => item.kind === "comment" ? commentCard(item.source) : postCard(item.source), "No activity yet.")
    };
    return (map[profileState.activeTab] || map.posts)();
}

export function render(container) {
    const profile = profileState.profile;
    const root = el("div", { className: `profile-app ${profile.activeTemplate.className} ${profileState.drawerOpen ? "drawer-open" : ""}` });
    const repaint = () => render(container);
    const close = () => { setDrawer(false); repaint(); };
    const body = el("main", { className: "profile-main" }, [
        hero(profile),
        stats(profile),
        tabs(profileState.activeTab, tab => { setTab(tab); repaint(); }),
        tabBody(profile)
    ]);
    root.append(drawer(profileState.drawerOpen, close), topbar(() => { toggleDrawer(); repaint(); }), body, bottomNav());
    container.replaceChildren(root);
}
