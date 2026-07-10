// B"H
/** Resolves an exact comment, activates its full alias inline, and lands on its true reader coordinate. */
import { setCurrentVerse, setCurrentSub } from "/heichelos/post/comments/state.js";
import { scrollToActiveEl } from "/heichelos/post/functions/interaction/scrolling.js";
function query() { return new URLSearchParams(location.search); }
async function json(url) {
    const response = await fetch(url, { cache:"no-store" });
    const payload = await response.json();
    if (!response.ok || payload?.error) throw new Error(payload?.error?.message || `Comment lookup failed: ${response.status}`);
    return payload?.success || payload;
}
async function fetchComment(commentId) {
    try { return await json(`/api/social/comments/url/${encodeURIComponent(commentId)}`); }
    catch (_) {
        const params = new URLSearchParams({
            heichelId:window.heichelId || window.post?.heichel?.id || "ikar",
            seriesId:window.series?.id || window.post?.parentSeriesId || "",
            postId:window.post?.id || ""
        });
        return await json(`/api/social/search/rag/comments/${encodeURIComponent(commentId)}?${params}`);
    }
}
function aliasOf(comment) { return comment.author || comment.aliasId || comment.dayuh?.aliasId || ""; }
function readerVerse(comment) { return String(comment.dayuh?.verseSection ?? comment.verseSection ?? "root"); }
function readerSub(comment) {
    const value = comment.dayuh?.subSection ?? comment.subsection;
    return value === undefined || value === null || value === "" ? null : String(value);
}
function activeAliases(alias) {
    const current = query().get("inline");
    let aliases = [];
    try { aliases = JSON.parse(current || "[]"); } catch (_) {}
    if (!Array.isArray(aliases)) aliases = [];
    if (alias && !aliases.includes(alias)) aliases.push(alias);
    return aliases;
}
function synchronizeUrl(comment) {
    const alias = aliasOf(comment);
    const verse = readerVerse(comment);
    const sub = readerSub(comment);
    const url = new URL(location.href);
    url.searchParams.set("idx", verse);
    if (sub === null) url.searchParams.delete("sub");
    else url.searchParams.set("sub", sub);
    url.searchParams.set("panel", "insights");
    url.searchParams.set("inline", JSON.stringify(activeAliases(alias)));
    history.replaceState({ ...(history.state || {}), exactComment:comment.id }, "", url);
    setCurrentVerse(verse);
    setCurrentSub(sub);
    return { alias, verse, sub };
}
function exactNode(commentId) {
    const escaped = CSS.escape(String(commentId));
    return document.querySelector(`[data-cid="${escaped}"], #comment-${escaped}`);
}
function reveal(node) {
    if (!node) return false;
    node.closest("details")?.setAttribute("open", "");
    node.closest(".commentator")?.classList.add("inline-gate-open");
    node.classList.add("signal-active", "pulse-of-light", "awtsmoos-deep-linked-comment");
    node.scrollIntoView({ behavior:"smooth", block:"center", inline:"nearest" });
    node.focus?.({ preventScroll:true });
    setTimeout(() => node.classList.remove("pulse-of-light"), 2800);
    return true;
}
async function manifestAlias(alias) {
    if (!alias) return null;
    document.body.dataset.inlineAliasLoading = alias;
    const { UnifiedOrchestrator } = await import("/heichelos/post/comments/inline/coordination/UnifiedOrchestrator.js");
    UnifiedOrchestrator.resetManifestation(alias);
    const stats = await UnifiedOrchestrator.manifestSingle(alias);
    document.body.dataset.inlineAliasReady = alias;
    delete document.body.dataset.inlineAliasLoading;
    return stats;
}
async function waitForExact(commentId, retries=40) {
    for (let attempt = 0; attempt < retries; attempt++) {
        const node = exactNode(commentId);
        if (node) return node;
        await new Promise(resolve => setTimeout(resolve, 90));
    }
    return null;
}
async function openInsights(alias, commentId) {
    if (!alias || typeof window.openCommentsPanelToAlias !== "function") return null;
    const panel = await window.openCommentsPanelToAlias(alias, true, true);
    const target = panel?.querySelector?.(`[data-cid="${CSS.escape(String(commentId))}"]`);
    target?.classList.add("signal-active");
    return panel;
}
export async function revealDeepLinkedComment() {
    const commentId = query().get("commentId");
    if (!commentId) return null;
    document.body.dataset.deepLinkedCommentState = "loading";
    const comment = await fetchComment(commentId);
    if (!comment?.id) throw new Error("The requested comment could not be found.");
    const { alias } = synchronizeUrl(comment);
    await scrollToActiveEl({ behavior:"auto", block:"center", retries:40 });
    const [stats] = await Promise.all([manifestAlias(alias), openInsights(alias, comment.id)]);
    const node = await waitForExact(comment.id);
    if (!reveal(node)) throw new Error(`Comment ${comment.id} loaded but its inline card was not found.`);
    document.body.dataset.deepLinkedComment = comment.id;
    document.body.dataset.deepLinkedCommentState = "ready";
    window.__awtsmoosExactCommentResult = { comment, stats, found:true, at:Date.now() };
    return comment;
}
