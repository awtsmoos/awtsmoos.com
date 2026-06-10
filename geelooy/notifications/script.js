// B"H
/**
 * @module NotificationsPage
 * @description
 * Chapter 23: The Awtsmoos turns activity into ordered sparks.
 *
 * This page is a calm notification sanctuary. It tries the live social API,
 * falls back to an empty state, and never blocks the profile/feed experience.
 */

const list = document.querySelector("[data-notification-list]");
const tabs = Array.from(document.querySelectorAll("[data-filter]"));
let allNotifications = [];
let activeFilter = "all";

function clean(value, fallback = "") {
    return String(value ?? fallback).replace(/[<>]/g, "").trim();
}

async function apiJson(url, options) {
    const response = await fetch(url, options);
    const json = await response.json().catch(() => null);
    if (!response.ok || json?.error) throw new Error(json?.error?.message || response.statusText);
    return json;
}

function normalize(payload) {
    const source = Array.isArray(payload) ? payload : payload?.success || payload?.notifications || [];
    return Array.isArray(source) ? source : [];
}

function iconFor(item) {
    const kind = clean(item.kind || item.type || item.action || "activity").toLowerCase();
    if (kind.includes("comment")) return "💬";
    if (kind.includes("follow")) return "✦";
    if (kind.includes("mention")) return "@";
    if (kind.includes("mail")) return "✉";
    return "◌";
}

function matchesFilter(item) {
    if (activeFilter === "all") return true;
    const haystack = `${item.kind || ""} ${item.type || ""} ${item.action || ""} ${item.message || ""}`.toLowerCase();
    return haystack.includes(activeFilter.slice(0, -1)) || haystack.includes(activeFilter);
}

function renderCard(item) {
    const card = document.createElement("article");
    card.className = `notification-card ${item.read ? "read" : "unread"}`;
    const title = clean(item.title || item.kind || item.type || "New activity");
    const body = clean(item.message || item.text || item.content || item.summary || "Something moved in the social light.");
    const time = clean(item.createdAt || item.timestamp || item.time || "now");
    card.innerHTML = `<span>${iconFor(item)}</span><div><strong>${title}</strong><p>${body}</p></div><small>${time}</small>`;
    return card;
}

function render() {
    if (!list) return;
    const visible = allNotifications.filter(matchesFilter);
    list.replaceChildren();
    if (!visible.length) {
        const empty = document.createElement("article");
        empty.className = "notification-card empty";
        empty.innerHTML = `<span>☼</span><div><strong>No notifications yet</strong><p>The chamber is quiet.</p></div><small>now</small>`;
        list.appendChild(empty);
        return;
    }
    visible.forEach(item => list.appendChild(renderCard(item)));
}

async function load() {
    try {
        const alias = await apiJson("/api/social/alias/default").then(data => data?.success).catch(() => "");
        const url = alias ? `/api/social/alias/${encodeURIComponent(alias)}/notifications` : "/api/social/notifications";
        allNotifications = normalize(await apiJson(url));
    } catch {
        allNotifications = [];
    }
    render();
}

tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.toggle("active", t === tab));
    activeFilter = tab.dataset.filter || "all";
    render();
}));

document.querySelector("[data-mark-all]")?.addEventListener("click", () => {
    allNotifications = allNotifications.map(item => ({ ...item, read: true }));
    render();
});

load();
