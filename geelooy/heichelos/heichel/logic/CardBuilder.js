/**
 * B"H
 * @module CardBuilder
 * @description
 * Every post is a letter (Ot) in the great scroll of the Heichel.
 * This module shapes those letters into visual Cards.
 * It utilizes the intensely fortified StringPurifier to ensure no 
 * 'undefined' kelipot or underscore chains disrupt the Divine presentation.
 */

import { DOMManifestor } from "./DOMManifestor.js";
import { StringPurifier } from "./StringPurifier.js";
import { HeichelState } from "./HeichelState.js";

export class CardBuilder {
    static generatePostURL(rootId, indexInSeries) {
        return `/heichelos/${HeichelState.heichelID}/series/${rootId}/${indexInSeries}`;
    }

    static generateSeriesURL(seriesId) {
        return location.pathname + "?" + new URLSearchParams({
            view: HeichelState.view,
            series: seriesId
        });
    }

    static build(items, type, sid, root) {
        const frag = document.createDocumentFragment();

        items.forEach((item, i) => {
            // B"H - Deep dive extraction to find the true essence
            const dt = type === "post" ? item : (item.prateem || item);
            
            // Search all possible dimensions for the name and description
            let rawTitle = dt?.title || dt?.name || item?.title || item?.name || "Untitled";
            let rawDesc = dt?.description || item?.description || "";
            
            // Pass through the absolute purifier
            let cleanTitle = StringPurifier.purify(rawTitle);
            let cleanDesc = StringPurifier.purify(rawDesc);
            
            if (!cleanTitle) cleanTitle = "Hidden Insight";
            
            const url = type === "post" ? this.generatePostURL(root.id, i) : this.generateSeriesURL(item.id);

            let previewHtml = "";
            if (type === "post" && item.content) {
                const purifiedContent = StringPurifier.purify(item.content);
                previewHtml = purifiedContent.substring(0, HeichelState.POST_LENGTH) + (purifiedContent.length > HeichelState.POST_LENGTH ? "..." : "");
            } else {
                // If it's empty, it remains empty, preventing the literal word "undefined"
                previewHtml = cleanDesc;
            }

            const plan = {
                tag: 'div',
                className: `post-card ${type}`,
                children:[
                    {
                        tag: 'h2',
                        className: `${type}-title`,
                        children:[{
                            tag: 'a',
                            href: url,
                            innerHTML: cleanTitle,
                            ...(type !== "post" ? { onclick: (e) => { e.preventDefault(); window.goto(url); } } : {})
                        }]
                    },
                    {
                        tag: 'div',
                        className: 'post-preview',
                        innerHTML: previewHtml
                    }
                ]
            };

            if (type === "post") {
                plan.children.push({
                    tag: 'a',
                    className: 'post-link',
                    href: url,
                    innerText: 'Read more'
                });
            }

            if (HeichelState.isEditing) {
                const editParams = new URLSearchParams({
                    type: type,
                    id: item.id,
                    editingAlias: HeichelState.isEditing,
                    parentSeriesId: sid,
                    indexInSeries: i,
                    returnURL: location.href
                });
                plan.children.push({
                    tag: 'div',
                    className: 'edit-section',
                    children:[
                        { tag: 'a', href: `/heichelos/${HeichelState.heichelID}/edit?${editParams}`, className: 'edit-content', innerText: 'Edit Content' },
                        { tag: 'a', href: `/heichelos/${HeichelState.heichelID}/delete?${editParams}`, innerText: 'Delete' }
                    ]
                });
            }

            frag.appendChild(DOMManifestor.create(plan));
        });

        return frag;
    }
}