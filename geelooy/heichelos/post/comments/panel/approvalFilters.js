// B"H
/**
 * @file approvalFilters.js
 * @description
 * Moderation receives lenses: all sparks, current section, or exact coordinate.
 */

function currentSectionValue() {
    return window.currentVerseSection ?? window.currentSection ?? window.activeSection ?? null;
}

function sameLoose(a, b) {
    return String(a ?? "") === String(b ?? "");
}

export function approvalFilterOptions() {
    return [
        { id: "all", label: "All" },
        { id: "section", label: "Current section" },
        { id: "coordinate", label: "Exact coordinate" }
    ];
}

export function approvalPassesFilter(comment, filter, coordinateFor) {
    if (filter === "all") return true;
    const coordinate = coordinateFor(comment);
    const current = currentSectionValue();

    if (filter === "section") {
        return current === null || sameLoose(coordinate.verseSection, current);
    }

    if (filter === "coordinate") {
        const activeSub = window.currentSubSection ?? window.activeSubSection ?? null;
        return (current === null || sameLoose(coordinate.verseSection, current)) &&
            (activeSub === null || sameLoose(coordinate.subSection, activeSub));
    }

    return true;
}
