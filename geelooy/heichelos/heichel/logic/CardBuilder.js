/**
 * B"H
 * @module CardBuilder
 * @description
 * Every post is a letter in the Heichel scroll. This builder now gives those
 * letters to the DOM as text, never as casual HTML, so descriptions containing
 * script tags become harmless purified words instead of leaking code onto the
 * page or into execution.
 */

import { DOMManifestor } from "./DOMManifestor.js";
import { StringPurifier } from "./StringPurifier.js";
import { HeichelState } from "./HeichelState.js";

function getItemDetails(item, type) {
    return type === "post" ? item : (item?.prateem || item || {});
}

function getCardTitle(item, type) {
    const details = getItemDetails(item, type);
    const raw = details?.title || details?.name || item?.title || item?.name || "Untitled";
    return StringPurifier.purify(raw) || "Hidden Insight";
}

function getCardPreview(item, type) {
    const details = getItemDetails(item, type);
    if (type === "post" && item?.content) {
        const content = StringPurifier.purify(item.content);
        const limit = HeichelState.POST_LENGTH;
        return content.substring(0, limit) + (content.length > limit ? "..." : "");
    }
    return StringPurifier.purify(details?.description || item?.description || "");
}

export class CardBuilder {
    static generatePostURL(rootId, indexInSeries) {
        return `/heichelos/${HeichelState.heichelID}/series/${rootId}/${indexInSeries}`;
    }

    static generateSeriesURL(seriesId) {
        return location.pathname + "?" + new URLSearchParams({ view: HeichelState.view, series: seriesId });
    }

    static build(items, type, sid, root) {
        const frag = document.createDocumentFragment();
        items.forEach((item, i) => frag.appendChild(DOMManifestor.create(this.planItem(item, type, sid, root, i))));
        return frag;
    }

    static planItem(item, type, sid, root, indexInSeries) {
        const url = type === "post" ? this.generatePostURL(root.id, indexInSeries) : this.generateSeriesURL(item.id);
        const plan = {
            tag: "div",
            className: `post-card ${type}`,
            children: [
                {
                    tag: "h2",
                    className: `${type}-title`,
                    children: [{
                        tag: "a",
                        href: url,
                        text: getCardTitle(item, type),
                        ...(type !== "post" ? { onclick: event => { event.preventDefault(); window.goto(url); } } : {})
                    }]
                },
                { tag: "div", className: "post-preview", text: getCardPreview(item, type) }
            ]
        };

        if (type === "post") plan.children.push({ tag: "a", className: "post-link", href: url, text: "Read more" });
        if (HeichelState.isEditing) plan.children.push(this.planEditSection(item, type, sid, indexInSeries));
        return plan;
    }

    static planEditSection(item, type, sid, indexInSeries) {
        const editParams = new URLSearchParams({
            type,
            id: item.id,
            editingAlias: HeichelState.isEditing,
            parentSeriesId: sid,
            indexInSeries,
            returnURL: location.href
        });
        return {
            tag: "div",
            className: "edit-section",
            children: [
                { tag: "a", href: `/heichelos/${HeichelState.heichelID}/edit?${editParams}`, className: "edit-content", text: "Edit Content" },
                { tag: "a", href: `/heichelos/${HeichelState.heichelID}/delete?${editParams}`, text: "Delete" }
            ]
        };
    }
}
