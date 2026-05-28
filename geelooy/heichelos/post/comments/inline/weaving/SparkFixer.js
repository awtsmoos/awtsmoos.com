/**
 * B"H
 * @module SparkFixer
 * @description
 * Seats already-fetched inline sparks into the correct vessel. A top-level API
 * `sub` or `subSection` echo is never trusted for placement; only a real
 * `dayuh.subSection` makes a comment paragraph-specific. Otherwise the note is
 * verse-level and gathers once at the end of its verse section.
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
import {
    polishCard,
    polishGate,
    refreshGatePolish
} from "/heichelos/post/comments/inline/weaving/polish/EditorialReadingPolish.js";

function escapeForAttr(value) {
    const str = String(value);
    if (globalThis.CSS && typeof globalThis.CSS.escape === "function") return globalThis.CSS.escape(str);
    return str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function parseDayuh(raw) {
    if (!raw) return {};
    if (typeof raw === "string") {
        try { return JSON.parse(raw) || {}; } catch { return {}; }
    }
    return typeof raw === "object" ? raw : {};
}

function hasSpecificDayuhSub(dayuh) {
    return Object.prototype.hasOwnProperty.call(dayuh, "subSection")
        && dayuh.subSection !== undefined
        && dayuh.subSection !== null
        && dayuh.subSection !== ""
        && dayuh.subSection !== "main"
        && dayuh.subSection !== "root";
}

function normalizeSparkCoordinates(spark) {
    const coords = parseDayuh(spark.dayuh);
    if (coords.verseSection === undefined || coords.verseSection === null) {
        if (spark.verseSection !== undefined && spark.verseSection !== null) coords.verseSection = spark.verseSection;
    }
    if (!hasSpecificDayuhSub(coords)) delete coords.subSection;
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
            const coords = normalizeSparkCoordinates(spark);
            const vessel = resolveCoordinateToDOM(coords);

            if (!vessel) {
                stats.missing++;
                return;
            }

            const shelter = ShelterArchitect.secureShelter(vessel);
            if (!shelter) { stats.missing++; return; }
            ShelterArchitect.clearStatus(shelter);
            connectShelterToVessel(shelter, vessel, coords);

            const gate = getOrCreateGate(shelter, alias, coords);
            bindReadingFocus(gate, vessel);
            polishGate(gate, vessel, coords);
            touchedGates.add(gate);
            rememberGateComment(gate, spark);

            if (shelter.querySelector(`[data-cid="${escapeForAttr(sparkIdStr)}"]`)) {
                stats.duplicates++;
                return;
            }

            const list = gate.querySelector(".comments-holder-inline");
            if (!list) { stats.missing++; return; }

            list.style.setProperty("display", "flex", "important");
            list.style.setProperty("visibility", "visible", "important");
            const card = makeInlineComment(spark);
            card.dataset.fromAlias = alias;
            card.dataset.cid = sparkIdStr;
            polishCard(card, spark, list.children.length);
            list.appendChild(card);
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
