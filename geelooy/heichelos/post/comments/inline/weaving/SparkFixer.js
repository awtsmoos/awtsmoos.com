/**
 * B"H
 * @module SparkFixer
 * @chapter Fixing the Vessels in the World of Action
 * @description
 * Weaves inline comments with status, deterministic cleanup, live count updates,
 * and editorial reading intelligence. The Awtsmoos does not throw sparks into a
 * heap; each spark is seated beside its paragraph, bound to a gate, and given a
 * preview so collapsed commentary remains meaningful.
 */

import { makeInlineComment } from "/heichelos/post/comments/render/core.js";
import { resolveCoordinateToDOM } from "/heichelos/post/comments/logic/inlineManifest/CoordinateResolver.js";
import { ShelterArchitect } from "/heichelos/post/comments/inline/weaving/ShelterArchitect.js";
import { GuardianGate } from "/heichelos/post/comments/inline/weaving/GuardianGate.js";
import {
    bindReadingFocus,
    connectShelterToVessel,
    hydrateGateSummary
} from "/heichelos/post/comments/inline/weaving/ThreadIntelligence.js";

function escapeForAttr(value) {
    const str = String(value);
    if (globalThis.CSS && typeof globalThis.CSS.escape === "function") return globalThis.CSS.escape(str);
    return str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function normalizeSparkCoordinates(spark) {
    const coords = (spark.dayuh && typeof spark.dayuh === "object") ? spark.dayuh : {};
    if (coords.verseSection === undefined || coords.verseSection === null) {
        if (spark.verseSection !== undefined && spark.verseSection !== null) coords.verseSection = spark.verseSection;
    }
    if (coords.subSection === undefined || coords.subSection === null) {
        if (spark.subSection !== undefined && spark.subSection !== null) coords.subSection = spark.subSection;
        else if (spark.sub !== undefined && spark.sub !== null) coords.subSection = spark.sub;
    }
    spark.dayuh = coords;
    return coords;
}

function getOrCreateGate(shelter, alias, coords) {
    let gate = Array.from(shelter.children).find(c =>
        c.classList.contains("commentator") && c.dataset.alias === alias
    );
    if (!gate) {
        gate = GuardianGate.build(alias, coords.verseSection, coords.subSection);
        shelter.appendChild(gate);
    }
    return gate;
}

function getPageShelters() {
    return Array.from(document.querySelectorAll('.marginal-gloss-shelter'));
}

function rememberGateComment(gate, spark) {
    if (!gate.__awtsmoosInlineComments) gate.__awtsmoosInlineComments = [];
    if (!gate.__awtsmoosInlineComments.some(item => String(item?.id) === String(spark?.id))) {
        gate.__awtsmoosInlineComments.push(spark);
    }
    hydrateGateSummary(gate, gate.__awtsmoosInlineComments);
}

export class SparkFixer {
    static showLoading(alias) {
        const shelters = getPageShelters();
        shelters.forEach(shelter => ShelterArchitect.setStatus(shelter, `Loading inline comments for @${alias}…`, "info"));
    }

    static showEmpty(alias) {
        const sections = document.querySelectorAll('.post-reader-localized-context .section, .section[data-awtsmoos-idx], .section[data-idx]');
        const first = sections[0];
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

        console.log(`%c B"H - [SparkFixer] Re-evaluating ${sparks.length} sparks for @${alias}.`, "color: #ff00ff;");

        const touchedGates = new Set();

        sparks.forEach(spark => {
            if (!spark || !spark.id) return;
            const sparkIdStr = String(spark.id);
            const coords = normalizeSparkCoordinates(spark);
            const vessel = resolveCoordinateToDOM(coords);

            if (!vessel) {
                stats.missing++;
                console.warn("B\"H - [SparkFixer] Missing anchor for inline comment", { alias, id: sparkIdStr, coords });
                return;
            }

            const shelter = ShelterArchitect.secureShelter(vessel);
            if (!shelter) { stats.missing++; return; }
            ShelterArchitect.clearStatus(shelter);
            connectShelterToVessel(shelter, vessel, coords);

            const alreadyExists = shelter.querySelector(`[data-cid="${escapeForAttr(sparkIdStr)}"]`);
            const gate = getOrCreateGate(shelter, alias, coords);
            bindReadingFocus(gate, vessel);
            touchedGates.add(gate);
            rememberGateComment(gate, spark);
            if (alreadyExists) { stats.duplicates++; return; }

            const list = gate.querySelector(".comments-holder-inline");
            if (!list) { stats.missing++; return; }

            list.style.setProperty("display", "flex", "important");
            list.style.setProperty("visibility", "visible", "important");
            const card = makeInlineComment(spark);
            card.dataset.fromAlias = alias;
            card.dataset.cid = sparkIdStr;
            list.appendChild(card);
            stats.inserted++;
        });

        touchedGates.forEach(gate => GuardianGate.updateCount(gate));

        if (stats.inserted === 0 && stats.duplicates === 0) this.showEmpty(alias);
        if (stats.inserted > 0) {
            console.log(`%c B"H - [SparkFixer] Anchored ${stats.inserted} unique insights into the margins for @${alias}.`, "color: #00ff00; font-weight: bold;");
        }
        return this.remember(stats);
    }

    static remember(stats) {
        if (typeof window !== "undefined") window.__awtsmoosInlineLastFix = stats;
        return stats;
    }
}
