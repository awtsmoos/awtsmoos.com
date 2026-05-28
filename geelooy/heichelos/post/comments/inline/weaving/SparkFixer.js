/**
 * B"H
 * @module SparkFixer
 * @description
 * Chapter 10: The Awtsmoos seats each spark once. A paragraph spark enters its
 * own chamber; a verse spark enters the end-courtyard. The whole document is
 * guarded so one alias and one comment ID can never duplicate across shelters.
 */

import { makeInlineComment } from "/heichelos/post/comments/render/core.js";
import { resolveCoordinateToDOM } from "/heichelos/post/comments/logic/inlineManifest/CoordinateResolver.js";
import { buildRealPlacementDayuh } from "/heichelos/post/comments/logic/inlineManifest/realCommentCoordinate.js";
import { ShelterArchitect } from "/heichelos/post/comments/inline/weaving/ShelterArchitect.js";
import { GuardianGate } from "/heichelos/post/comments/inline/weaving/GuardianGate.js";
import { inlineDuplicateExists } from "/heichelos/post/comments/inline/weaving/DuplicateGuard.js";
import {
    bindReadingFocus,
    connectShelterToVessel,
    hydrateGateSummary
} from "/heichelos/post/comments/inline/weaving/ThreadIntelligence.js";
import {
    polishCard,
    polishGate,
    refreshGatePolish
} from "/heichelos/post/comments/inline/weaving/polish/EditorialReadingPolish.js";

function normalizeSparkCoordinates(spark) {
    const coords = buildRealPlacementDayuh(spark, spark?.dayuh?.verseSection ?? spark?.verseSection ?? null);
    spark.dayuh = coords;
    return coords;
}

function getOrCreateGate(shelter, alias, coords) {
    let gate = Array.from(shelter.children).find(c => c.classList.contains("commentator") && c.dataset.alias === alias);
    if (!gate) {
        gate = GuardianGate.build(alias, coords.verseSection, coords.subSection);
        shelter.appendChild(gate);
    }
    return gate;
}

function getPageShelters() {
    return Array.from(document.querySelectorAll(".marginal-gloss-shelter"));
}

function rememberGateComment(gate, spark) {
    if (!gate.__awtsmoosInlineComments) gate.__awtsmoosInlineComments = [];
    if (!gate.__awtsmoosInlineComments.some(item => String(item?.id) === String(spark?.id))) gate.__awtsmoosInlineComments.push(spark);
    hydrateGateSummary(gate, gate.__awtsmoosInlineComments);
}

function findInlineSections() {
    return document.querySelectorAll(".post-reader-localized-context .section, .section[data-awtsmoos-idx], .section[data-idx]");
}

function appendCard(list, spark, alias, sparkIdStr) {
    list.style.setProperty("display", "flex", "important");
    list.style.setProperty("visibility", "visible", "important");
    const card = makeInlineComment(spark);
    card.dataset.fromAlias = alias;
    card.dataset.cid = sparkIdStr;
    polishCard(card, spark, list.children.length);
    list.appendChild(card);
}

export class SparkFixer {
    static showLoading(alias) {
        getPageShelters().forEach(shelter => ShelterArchitect.setStatus(shelter, `Loading inline comments for @${alias}…`, "info"));
    }

    static showEmpty(alias) {
        const first = findInlineSections()[0];
        if (!first) return;
        const shelter = ShelterArchitect.secureShelter(first);
        ShelterArchitect.setStatus(shelter, `No inline comments found for @${alias} on the rendered text.`, "empty");
    }

    static fix(sparks, alias) {
        const stats = { requested: Array.isArray(sparks) ? sparks.length : 0, inserted: 0, duplicates: 0, missing: 0, alias };
        if (!Array.isArray(sparks) || sparks.length === 0) {
            this.showEmpty(alias);
            return this.remember(stats);
        }

        const touchedGates = new Set();
        sparks.forEach(spark => {
            if (!spark || !spark.id) return;
            const sparkIdStr = String(spark.id);
            if (inlineDuplicateExists(document, sparkIdStr, alias)) { stats.duplicates++; return; }

            const coords = normalizeSparkCoordinates(spark);
            const vessel = resolveCoordinateToDOM(coords);
            if (!vessel) { stats.missing++; return; }

            const shelter = ShelterArchitect.secureShelter(vessel);
            if (!shelter) { stats.missing++; return; }
            ShelterArchitect.clearStatus(shelter);
            connectShelterToVessel(shelter, vessel, coords);

            const gate = getOrCreateGate(shelter, alias, coords);
            bindReadingFocus(gate, vessel);
            polishGate(gate, vessel, coords);
            touchedGates.add(gate);
            rememberGateComment(gate, spark);

            const list = gate.querySelector(".comments-holder-inline");
            if (!list) { stats.missing++; return; }
            appendCard(list, spark, alias, sparkIdStr);
            refreshGatePolish(gate);
            stats.inserted++;
        });

        touchedGates.forEach(gate => {
            GuardianGate.updateCount(gate);
            refreshGatePolish(gate);
        });
        if (stats.inserted === 0 && stats.duplicates === 0) this.showEmpty(alias);
        return this.remember(stats);
    }

    static remember(stats) {
        if (typeof window !== "undefined") window.__awtsmoosInlineLastFix = stats;
        return stats;
    }
}
