// B"H
/**
 * @module ViewHistoryRecorder
 * @description
 * Chapter 425: The browser whispers, "I was here," and the profile remembers.
 */

export async function recordView(aliasId, data = {}) {
    if (!aliasId) return null;
    const payload = {
        type: data.type || "page",
        id: data.id || data.postId || data.seriesId || data.heichelId || location.pathname,
        title: data.title || document.title || location.pathname,
        url: data.url || location.pathname + location.search + location.hash,
        heichelId: data.heichelId || "",
        seriesId: data.seriesId || "",
        postId: data.postId || "",
        viewedAt: String(Date.now())
    };
    try {
        const response = await fetch(`/api/social/alias/${encodeURIComponent(aliasId)}/history`, { method: "POST", body: new URLSearchParams(payload) });
        return await response.json().catch(() => null);
    } catch (error) {
        console.warn("B\"H history record failed", error);
        return null;
    }
}

export function recordViewFromWindow(aliasId = window.curAlias || window.currentAlias || "") {
    const parts = location.pathname.split("/").filter(Boolean);
    const heichelIndex = parts.indexOf("heichelos");
    const heichelId = heichelIndex >= 0 ? parts[heichelIndex + 1] || "" : "";
    const seriesIndex = parts.indexOf("series");
    const seriesId = seriesIndex >= 0 ? parts[seriesIndex + 1] || "" : "";
    const postId = seriesIndex >= 0 ? parts[seriesIndex + 2] || "" : "";
    const type = postId ? "post" : seriesId ? "series" : heichelId ? "heichel" : "page";
    return recordView(aliasId, { type, heichelId, seriesId, postId, title: document.title });
}
