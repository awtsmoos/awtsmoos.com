// B"H
/**
 * @module GatewayFactory
 * @description
 * Chapter 87: The old guardian gateway is made vertical.
 *
 * Legacy callers still ask this factory for an inline doorway. It now returns
 * class-only markup with a block list. No inline display:flex, no horizontal
 * scroll, no cramped sideways conduit.
 */

import { BlueprintManifestor } from "../../logic/manifestation/BlueprintManifestor.js";
import { SidebarConduit } from "../../../ui/sidebar/SidebarConduit.js";

export class GatewayFactory {
    static forgeGateway(alias, verseIdx) {
        const blueprint = {
            tag: "section",
            attr: { class: "commentator inline-holder awtsmoos-inline-shell", "data-alias": alias, "data-idx": verseIdx },
            children: [
                {
                    tag: "button",
                    attr: { class: "inline-summary-btn active awtsmoos-inline-trigger", type: "button", "aria-expanded": "true" },
                    children: [
                        { tag: "span", attr: { class: "awtsmoos-inline-trigger-sigil" }, children: ["💬"] },
                        { tag: "span", attr: { class: "awtsmoos-inline-trigger-copy" }, children: [
                            { tag: "strong", attr: { class: "awtsmoos-inline-trigger-title" }, children: ["Insights"] },
                            { tag: "span", attr: { class: "awtsmoos-inline-trigger-subtitle" }, children: [`@${alias}`] }
                        ] }
                    ],
                    events: { click: event => this.toggle(event, verseIdx) }
                },
                { tag: "div", attr: { class: "comments-holder-inline awtsmoos-inline-comments" } }
            ]
        };
        return BlueprintManifestor.manifest(blueprint);
    }

    static toggle(event, verseIdx) {
        event.stopPropagation();
        SidebarConduit.revealInsights({ verseIdx });
        const list = event.currentTarget.nextElementSibling;
        if (!list) return;
        const isHidden = list.hidden;
        list.hidden = !isHidden;
        event.currentTarget.classList.toggle("active", isHidden);
        event.currentTarget.setAttribute("aria-expanded", String(isHidden));
    }
}
