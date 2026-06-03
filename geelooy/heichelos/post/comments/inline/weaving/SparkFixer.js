// B"H
/**
 * @module SparkFixer
 * @description
 * Chapter 131: The margin accepts each spark once, then removes the loading fog.
 * Inline placement deduplicates by real identity and by the already-rendered
 * document. Loading status never remains under successful cards.
 */

import { makeInlineComment } from "/heichelos/post/comments/render/core.js";
import { resolveCoordinateToDOM } from "/heichelos/post/comments/logic/inlineManifest/CoordinateResolver.js";
import { buildRealPlacementDayuh } from "/heichelos/post/comments/logic/inlineManifest/realCommentCoordinate.js";
import { uniqueComments } from "/heichelos/post/comments/logic/treeBuilder.js";
import { ShelterArchitect } from "/heichelos/post/comments/inline/weaving/ShelterArchitect.js";
import { GuardianGate } from "/heichelos/post/comments/inline/weaving/GuardianGate.js";
import { inlineDuplicateExists } from "/heichelos/post/comments/inline/weaving/DuplicateGuard.js";
import { bindReadingFocus, connectShelterToVessel, hydrateGateSummary } from "/heichelos/post/comments/inline/weaving/ThreadIntelligence.js";
import { polishGate, refreshGatePolish } from "/heichelos/post/comments/inline/weaving/polish/EditorialReadingPolish.js";

function placementCoords(spark) {
    return buildRealPlacementDayuh(spark, spark?.dayuh?.verseSection ?? spark?.verseSection ?? null);
}

function getPageShelters() {
    return Array.from(document.querySelectorAll(".marginal-gloss-shelter"));
}

function clearAllLoadingStatuses() {
    getPageShelters().forEach(shelter => ShelterArchitect.clearStatus(shelter));
}

function getOrCreateGate(shelter, alias, coords) {
    let gate = Array.from(shelter.children).find(child => child.classList.contains("commentator") && child.dataset.alias === alias);
    if (!gate) {
        gate = GuardianGate.build(alias, coords.verseSection, coords.subSection);
        shelter.appendChild(gate);
    }
    return gate;
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
    const id = CSS.escape(sparkIdStr);
    const safeAlias = CSS.escape(alias);
    const existing = list.querySelector(`[data-cid="${id}"][data-from-alias="${safeAlias}"]`);
    if (existing) return false;
    const card = makeInlineComment(spark);
    card.dataset.fromAlias = alias;
    card.dataset.cid = sparkIdStr;
    list.appendChild(card);
    return true;
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
        clearAllLoadingStatuses();
        const clean = uniqueComments(sparks);
        const stats = { requested: Array.isArray(sparks) ? sparks.length : 0, unique: clean.length, inserted: 0, duplicates: 0, missing: 0, alias };
        if (!clean.length) { this.showEmpty(alias); return this.remember(stats); }
        const touchedGates = new Set();
        clean.forEach(spark => this.placeSpark(spark, alias, stats, touchedGates));
        touchedGates.forEach(gate => {
            GuardianGate.updateCount(gate);
            refreshGatePolish(gate);
        });
        clearAllLoadingStatuses();
        if (stats.inserted === 0 && stats.duplicates === 0) this.showEmpty(alias);
        return this.remember(stats);
    }

    static placeSpark(spark, alias, stats, touchedGates) {
        if (!spark?.id) return;
        const sparkIdStr = String(spark.id);
        if (inlineDuplicateExists(document, sparkIdStr, alias)) { stats.duplicates++; return; }
        const coords = placementCoords(spark);
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
        if (appendCard(list, spark, alias, sparkIdStr)) stats.inserted++;
        else stats.duplicates++;
    }

    static remember(stats) {
        if (typeof window !== "undefined") window.__awtsmoosInlineLastFix = stats;
        return stats;
    }
}
