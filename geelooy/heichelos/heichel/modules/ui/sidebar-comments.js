// B"H
/**
 * @module SidebarComments
 * @description
 * Chapter 13: The Awtsmoos places comments beside the reader, not over him.
 *
 * A post card can whisper its discussion into the side chamber. The reader's
 * main path remains steady; the comments become a companion lantern in the
 * sidebar, powered by the real comment API and tolerant of old root-series
 * routes.
 */

import { listCommentAuthors, listCommentsByAlias } from "../api/comments.js";

function clean(value, fallback = "") {
    return String(value ?? fallback).replace(/[<>]/g, "").trim();
}

function getMount() {
    return document.querySelector(".geelooy-sidebar-comments");
}

function setStatus(mount, text) {
    mount.replaceChildren();
    const header = document.createElement("div");
    header.className = "section-header";
    header.textContent = "Reader Comments";
    const body = document.createElement("p");
    body.textContent = text;
    mount.append(header, body);
}

function commentCard({ aliasId, comment }) {
    const card = document.createElement("article");
    card.className = "geelooy-sidebar-comment-card";
    const who = document.createElement("strong");
    who.textContent = clean(aliasId, "alias");
    const body = document.createElement("p");
    body.textContent = clean(comment?.content || comment?.dayuh?.content || comment?.text || "A quiet comment.");
    card.append(who, body);
    return card;
}

async function commentsForAlias({ heichelId, postId, seriesId, verseSection, aliasId }) {
    const response = await listCommentsByAlias({ heichelId, postId, seriesId, verseSection, aliasId });
    const comments = Array.isArray(response?.success) ? response.success : [];
    return comments.map(comment => ({ aliasId, comment }));
}

export async function renderSidebarComments({ heichelId, postId, title, seriesId = "root", verseSection = "root" }) {
    const mount = getMount();
    if (!mount || !heichelId || !postId) return null;
    setStatus(mount, `Loading comments for ${clean(title, postId)}...`);
    try {
        const authorsResponse = await listCommentAuthors({ heichelId, postId, seriesId, verseSection });
        const authors = Array.isArray(authorsResponse?.success) ? authorsResponse.success : [];
        mount.replaceChildren();
        const header = document.createElement("div");
        header.className = "section-header";
        header.textContent = `Reader Comments · ${clean(title, postId)}`;
        mount.appendChild(header);
        if (!authors.length) {
            const empty = document.createElement("p");
            empty.textContent = "No comments yet. The side chamber is listening.";
            mount.appendChild(empty);
            return [];
        }
        const batches = await Promise.all(authors.slice(0, 6).map(aliasId => commentsForAlias({ heichelId, postId, seriesId, verseSection, aliasId })));
        const comments = batches.flat().slice(0, 8);
        comments.forEach(item => mount.appendChild(commentCard(item)));
        return comments;
    } catch (error) {
        setStatus(mount, error.message || "Comments could not be loaded.");
        return null;
    }
}
