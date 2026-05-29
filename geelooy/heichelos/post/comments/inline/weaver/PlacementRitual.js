// B"H
/**
 * @module PlacementRitual
 * @chapter The Fixing of the Sparks
 * @description
 * The inline weaver receives sparks of comment data and fastens them into the
 * exact shelters prepared around the text. Its imports must walk by true
 * measured paths: from `comments/inline/weaver/` two ascents reach `comments/`,
 * then the resolver is found under `logic/inlineManifest/`. When that path is
 * wrong, the browser searches a false chamber and receives the wrong garment.
 *
 * The Awtsmoos is not a body and not a form; nevertheless every created thing
 * receives its defined place. So this ritual does not guess. It asks the
 * CoordinateResolver for the vessel, establishes a shelter, forges a gateway,
 * and only then places the card in the revealed world.
 */

import { makeInlineComment } from "../../render/core.js";
import { resolveCoordinateToDOM } from "../../logic/inlineManifest/CoordinateResolver.js";
import { ShelterFactory } from "./ShelterFactory.js";
import { GatewayFactory } from "./GatewayFactory.js";

/**
 * Mounts inline comment sparks into their resolved DOM shelters.
 */
export class PlacementRitual {
    /**
     * Distributes purified comments into their physical placeholders.
     *
     * @param {Array<object>} sparks - Purified comments to manifest inline.
     * @param {string} alias - Author identity used for the gateway grouping.
     * @returns {void}
     */
    static execute(sparks, alias) {
        if (!Array.isArray(sparks)) return;

        sparks.forEach(spark => {
            const coords = spark.dayuh || {};
            const verseIdx = coords.verseSection;
            const vessel = resolveCoordinateToDOM(coords);

            if (!vessel) return;

            const shelter = ShelterFactory.establishShelter(vessel);
            const gateway = this.findOrForgeGateway(shelter, alias, verseIdx);
            const listContainer = gateway.querySelector(".comments-holder-inline");

            if (!listContainer || listContainer.querySelector(`[data-cid="${spark.id}"]`)) return;

            const card = makeInlineComment(spark);
            card.dataset.fromAlias = alias;
            listContainer.appendChild(card);
        });
    }

    /**
     * Finds an existing commentator gateway or creates one.
     *
     * @param {HTMLElement} shelter - The inline shelter around a text vessel.
     * @param {string} alias - Author alias stored in gateway dataset.
     * @param {string|number|undefined} verseIdx - Verse coordinate for labels.
     * @returns {HTMLElement} Existing or newly forged gateway.
     */
    static findOrForgeGateway(shelter, alias, verseIdx) {
        for (const child of shelter.children) {
            if (child.classList.contains("commentator") && child.dataset.alias === alias) {
                return child;
            }
        }

        const gateway = GatewayFactory.forgeGateway(alias, verseIdx);
        shelter.appendChild(gateway);
        return gateway;
    }
}
