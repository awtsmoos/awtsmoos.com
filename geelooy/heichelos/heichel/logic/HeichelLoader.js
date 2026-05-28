/**
 * B"H
 * @module HeichelLoader
 * @description
 * The central loading consciousness of the Heichel. It now speaks every title,
 * breadcrumb, empty message, and description as text, never casual HTML, so the
 * heichel can display data without displaying or executing script vessels.
 */

import { HeichelState } from "./HeichelState.js";
import { HeichelAPI } from "./HeichelAPI.js";
import { StringPurifier } from "./StringPurifier.js";
import { CardBuilder } from "./CardBuilder.js";
import { AdminControls } from "./AdminControls.js";
import { TabController } from "./TabController.js";

window.goto = url => { location.href = url; };

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = StringPurifier.purify(value);
    return element;
}

function clearAndText(element, value) {
    if (!element) return;
    element.textContent = StringPurifier.purify(value);
}

function makeBreadcrumbLink(series) {
    const rawName = StringPurifier.purify(series?.prateem?.name || series?.name || "");
    if (!rawName) return null;
    const link = document.createElement("a");
    link.href = location.pathname + "?" + new URLSearchParams({ view: HeichelState.view, series: series.id });
    link.textContent = rawName;
    link.addEventListener("click", event => { event.preventDefault(); window.goto(link.href); });
    return { link, nameKey: rawName.toLowerCase() };
}

function appendBreadcrumbSeparator(parent) {
    const separator = document.createElement("span");
    separator.className = "crumb-separator";
    separator.textContent = " / ";
    parent.appendChild(separator);
}

async function renderBreadcrumb(seriesId) {
    const parent = document.getElementById("parentS");
    if (!parent) return;
    parent.classList.remove("hidden");
    parent.replaceChildren();
    const breadcrumb = await HeichelAPI.getBreadcrumb(HeichelState.heichelID, seriesId);
    window.breadcrumb = breadcrumb;

    const seenNames = new Set();
    let added = 0;
    for (let i = breadcrumb.length - 1; i >= 0; i--) {
        const made = makeBreadcrumbLink(breadcrumb[i]);
        if (!made || seenNames.has(made.nameKey)) continue;
        seenNames.add(made.nameKey);
        if (added > 0) appendBreadcrumbSeparator(parent);
        parent.appendChild(made.link);
        added++;
    }
}

async function renderSeriesHeader(seriesId, root) {
    setText("seriesNm", root?.prateem?.name || "");
    setText("seriesDesc", root?.prateem?.description || "");
    if (seriesId !== "root") document.getElementById("seriesNameAndInfo")?.classList.remove("hidden");
}

async function renderPosts(seriesId, root) {
    const propertyMap = { content: 256, title: true, postId: true, author: true, id: true, seriesId: true, indexInSeries: true };
    const posts = await HeichelAPI.getPostsDetails(HeichelState.heichelID, root.id, propertyMap);
    const postsList = document.getElementById("postsList");
    if (!postsList) return [];
    postsList.replaceChildren();
    if (posts.length) {
        postsList.appendChild(CardBuilder.build(posts, "post", seriesId, root));
        if (HeichelState.view !== "series") document.getElementById("postsTab")?.click();
    } else clearAndText(postsList, "No posts here yet!");
    document.querySelector(".loadingPosts")?.classList.add("hidden");
    return posts;
}

async function renderSeries(seriesId, root, posts) {
    const series = await HeichelAPI.getSubSeriesDetails(HeichelState.heichelID, seriesId, root.subSeries);
    const seriesList = document.getElementById("seriesList");
    if (!seriesList) return;
    seriesList.replaceChildren();
    if (series.length) {
        seriesList.appendChild(CardBuilder.build(series, "series", seriesId, root));
        if (!posts.length) document.getElementById("seriesTab")?.click();
    } else clearAndText(seriesList, "No series here yet!");
    document.querySelector(".loadingSeries")?.classList.add("hidden");
}

export async function start() {
    if (HeichelState.heichelID === "undefined" || !HeichelState.heichelID) {
        alert("B\"H - That heichel doesn't exist!");
        location.href = "/";
        return;
    }
    TabController.init();
    await load(HeichelState.series);
}

async function load(seriesId) {
    window.heichel = await HeichelAPI.getHeichel(HeichelState.heichelID);
    window.curAlias = window.curAlias || localStorage.getItem("lastAliasUsed") || null;
    window.ownsIt = await HeichelAPI.doesOwn(window.curAlias, HeichelState.heichelID);
    if (window.ownsIt) AdminControls.addSubmitButtons();

    await renderBreadcrumb(seriesId);
    const root = await HeichelAPI.getSeriesDetails(HeichelState.heichelID, seriesId);
    if (!root || !Array.isArray(root.posts)) {
        if (seriesId !== "root") alert("Path not found: " + seriesId);
        return;
    }

    await renderSeriesHeader(seriesId, root);
    const posts = await renderPosts(seriesId, root);
    await renderSeries(seriesId, root, posts);
}

window.addEventListener("awtsmoosAliasChange", async event => {
    window.curAlias = event?.detail?.id;
    window.ownsIt = await HeichelAPI.doesOwn(window.curAlias, HeichelState.heichelID);
    AdminControls.removeAdminButtons();
    if (window.ownsIt) AdminControls.addSubmitButtons();
});

document.addEventListener("DOMContentLoaded", start);
