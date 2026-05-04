
/**
 * B"H
 * @module PlacementRitual
 * @chapter The Fixing of the Sparks
 * @description
 * After the shelters are established and the gateways are forged, 
 * the PlacementRitual takes the actual comment data (the Sparks) 
 * and secures them into their physical placeholders.
 * 
 * "He gives to each thing its proper place."
 */

import { makeInlineComment } from "../../render/core.js";
import { resolveCoordinateToDOM } from "../logic/inlineManifest/CoordinateResolver.js";
import { ShelterFactory } from "./ShelterFactory.js";
import { GatewayFactory } from "./GatewayFactory.js";

export class PlacementRitual {
    /**
     * @method execute
     * @description
     * Performs the holy work of distributing a list of sparks to the DOM.
     * 
     * @param {Array} sparks - The list of purified comments.
     * @param {string} alias - The identity of the author.
     */
    static execute(sparks, alias) {
        if (!Array.isArray(sparks)) return;

        sparks.forEach(spark => {
            const coords = spark.dayuh || {};
            const verseIdx = coords.verseSection;
            const vessel = resolveCoordinateToDOM(coords);

            if (vessel) {
                const shelter = ShelterFactory.establishShelter(vessel);
                
                // Find or Forge the Gateway for this alias in this shelter
                let gateway = null;
                for (const child of shelter.children) {
                    if (child.classList.contains("commentator") && child.dataset.alias === alias) {
                        gateway = child;
                        break;
                    }
                }

                if (!gateway) {
                    gateway = GatewayFactory.forgeGateway(alias, verseIdx);
                    shelter.appendChild(gateway);
                }

                const listContainer = gateway.querySelector(".comments-holder-inline");
                if (listContainer) {
                    // Guard against double manifestation
                    if (!listContainer.querySelector(`[data-cid="${spark.id}"]`)) {
                        const card = makeInlineComment(spark);
                        card.dataset.fromAlias = alias;
                        listContainer.appendChild(card);
                    }
                }
            }
        });
    }
}
