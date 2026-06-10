// B"H
/**
 * @module ProfileControlCenter
 * @description
 * Chapter 16: The Awtsmoos makes the user's own profile a command palace.
 *
 * The profile page is no longer a plain alias list. It is a social dashboard:
 * aliases, default identity, owned Heichelos, and quick paths into edit, mail,
 * public profile, and creation. All data comes from the live social API.
 */

const state = { aliases: [], defaultAlias: "", heichelosByAlias: new Map() };

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

function text(value, fallback = "") {
    return String(value ?? fallback).replace(/[<>]/g, "").trim();
}

async function apiJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.error) throw new Error(data?.error?.message || data?.message || response.statusText);
    return data;
}

function setStat(name, value) {
    const el = document.querySelector(`[data-profile-stat="${name}"]`);
    if (el) el.textContent = value;
}

function bindTabs() {
    $$("[data-profile-tab]").forEach(button => {
        button.addEventListener("click", () => {
            $$("[data-profile-tab]").forEach(tab => tab.classList.toggle("active", tab === button));
            $$("[data-profile-panel]").forEach(panel => panel.classList.toggle("hidden", panel.dataset.profilePanel !== button.dataset.profileTab));
        });
    });
}

function aliasAvatar(alias) {
    return text(alias.name || alias.id || "A").slice(0, 1).toUpperCase();
}

function aliasCard(alias) {
    const card = document.createElement("article");
    card.className = `social-alias-card ${alias.default ? "default" : ""}`;
    card.innerHTML = `
        <div class="alias-avatar">${aliasAvatar(alias)}</div>
        <div class="alias-copy">
            <a class="alias-id" href="/@${encodeURIComponent(alias.id)}">@${text(alias.id)}</a>
            <h3>${text(alias.name || alias.id)}</h3>
            <p>${text(alias.description || "A quiet identity awaiting a voice.")}</p>
            <div class="alias-card-actions">
                <a href="./alias-manage?${new URLSearchParams({ alias: alias.id, action: "update" })}">Edit Profile</a>
                <a href="/email?alias=${encodeURIComponent(alias.id)}">Mail</a>
                <button type="button" data-default-alias="${text(alias.id)}">${alias.default ? "Default" : "Make Default"}</button>
            </div>
        </div>`;
    return card;
}

async function setDefaultAlias(aliasId, button) {
    if (!aliasId || state.defaultAlias === aliasId) return;
    button.textContent = "Saving...";
    const result = await apiJson("/api/social/alias/default", { method: "POST", body: `alias=${encodeURIComponent(aliasId)}` });
    if (!result?.success) throw new Error("Default alias was not saved.");
    state.defaultAlias = aliasId;
    state.aliases.forEach(alias => alias.default = alias.id === aliasId);
    dispatchEvent(new CustomEvent("awtsmoosAliasChange", { detail: { id: aliasId } }));
    renderAliases();
}

function renderAliases() {
    const list = $(".alias-list");
    if (!list) return;
    list.replaceChildren();
    if (!state.aliases.length) {
        list.appendChild(emptyCard("No aliases yet. Create your first identity and enter the network."));
        return;
    }
    state.aliases.forEach(alias => list.appendChild(aliasCard(alias)));
    list.querySelectorAll("[data-default-alias]").forEach(button => {
        button.addEventListener("click", () => setDefaultAlias(button.dataset.defaultAlias, button).catch(error => button.textContent = error.message));
    });
}

function emptyCard(message) {
    const card = document.createElement("article");
    card.className = "social-empty-card";
    card.textContent = message;
    return card;
}

function heichelCard(heichel, aliasId) {
    const card = document.createElement("article");
    card.className = "social-heichel-card";
    const id = text(heichel.id || heichel.heichelId || heichel.inputId);
    card.innerHTML = `
        <div class="heichel-card-banner"></div>
        <div class="heichel-card-body">
            <div class="heichel-seal-small">♛</div>
            <div>
                <h3>${text(heichel.name || id)}</h3>
                <p>${text(heichel.description || "A sacred social space.")}</p>
                <small>Owner: @${text(aliasId)}</small>
            </div>
            <a href="/heichelos/${encodeURIComponent(id)}/?editingAlias=${encodeURIComponent(aliasId)}">Open</a>
        </div>`;
    return card;
}

async function loadHeichelosForAlias(alias) {
    try {
        const data = await apiJson(`/api/social/alias/${encodeURIComponent(alias.id)}/heichelos/details`);
        const list = Array.isArray(data) ? data : data?.success || [];
        state.heichelosByAlias.set(alias.id, list);
        return list.map(heichel => ({ heichel, aliasId: alias.id }));
    } catch {
        state.heichelosByAlias.set(alias.id, []);
        return [];
    }
}

async function renderHeichelos() {
    const list = $(".heichel-list");
    if (!list) return;
    list.replaceChildren(emptyCard("Loading your Heichelos..."));
    const groups = await Promise.all(state.aliases.map(loadHeichelosForAlias));
    const items = groups.flat();
    list.replaceChildren();
    if (!items.length) {
        list.appendChild(emptyCard("No Heichelos yet. Open the forge from your alias and create a space."));
    } else {
        items.forEach(item => list.appendChild(heichelCard(item.heichel, item.aliasId)));
    }
    setStat("heichelos", String(items.length));
}

async function loadProfile() {
    const defaultResult = await apiJson("/api/social/alias/default").catch(() => ({}));
    state.defaultAlias = defaultResult?.success || "";
    const aliases = await apiJson("/api/social/aliases/details");
    state.aliases = (Array.isArray(aliases) ? aliases : aliases?.success || []).map(alias => ({ ...alias, default: alias.id === state.defaultAlias }));
    if (state.defaultAlias) state.aliases.sort((a, b) => Number(b.default) - Number(a.default));
    setStat("aliases", String(state.aliases.length));
    setStat("defaultAlias", state.defaultAlias ? `@${state.defaultAlias}` : "None");
    renderAliases();
    await renderHeichelos();
}

window.addEventListener("DOMContentLoaded", async () => {
    bindTabs();
    try {
        await loadProfile();
    } catch (error) {
        $(".alias-list")?.replaceChildren(emptyCard(error.message || "Could not load profile."));
    }
});
