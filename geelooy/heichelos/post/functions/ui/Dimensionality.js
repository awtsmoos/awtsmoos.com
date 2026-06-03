
/**
 * B"H
 * @module Dimensionality
 * @chapter The Proportions of the Vessels
 * @description
 * The main Torah letters may thunder. Inline commentary bodies may echo that
 * thunder softly. Headers, labels, chips, and metadata must remain small lamps.
 * This module writes every related CSS variable together so old single-variable
 * scaling can no longer make inline headers enormous.
 */

const DEFAULT_FONT_SIZE = 42;
const MIN_FONT_SIZE = 18;
const MAX_FONT_SIZE = 120;
const STEP = 4;

function context() {
    return document.querySelector(".post-reader-localized-context");
}

function clean(value, fallback = DEFAULT_FONT_SIZE) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, parsed));
}

function px(value) {
    return `${Math.round(value * 100) / 100}px`;
}

function bounded(main, ratio, min, max) {
    return px(Math.min(max, Math.max(min, main * ratio)));
}

function varsFor(mainSize) {
    const main = clean(mainSize);
    return {
        "--post-text-size": px(main),
        "--post-inline-body-size": bounded(main, 0.86, 30, 82),
        "--post-sidebar-comment-size": bounded(main, 0.62, 22, 56),
        "--post-inline-summary-size": bounded(main, 0.18, 13, 23),
        "--post-inline-label-size": bounded(main, 0.16, 13, 22),
        "--post-inline-meta-size": bounded(main, 0.145, 12, 18),
        "--post-ui-chip-size": bounded(main, 0.17, 14, 24)
    };
}

function targets(ctx) {
    return [document.documentElement, document.body, ctx, document.getElementById("realPost")].filter(Boolean);
}

/**
 * @function applyReaderScale
 * @description
 * Applies main text and all dependent small UI scales in one atomic breath.
 * @param {number|string} size - Main reader font size.
 * @returns {string} The applied main font size.
 */
export function applyReaderScale(size) {
    const ctx = context();
    if (!ctx) return "";
    const vars = varsFor(size);
    targets(ctx).forEach(target => Object.entries(vars).forEach(([key, value]) => target.style.setProperty(key, value)));
    localStorage.currentPostFontSize = vars["--post-text-size"];
    window.dispatchEvent(new CustomEvent("awtsmoos:font-size", { detail: { size: vars["--post-text-size"], vars } }));
    return vars["--post-text-size"];
}

/**
 * @function adjustFontSize
 * @description
 * Changes the physical scale of the main revelation while preserving smaller
 * proportional inline headings and metadata.
 * @param {string} action - Either 'increase' or 'decrease'.
 * @returns {string} Applied main font size.
 */
export function adjustFontSize(action) {
    const ctx = context();
    if (!ctx) return "";
    const raw = ctx.style.getPropertyValue("--post-text-size") || getComputedStyle(ctx).getPropertyValue("--post-text-size") || DEFAULT_FONT_SIZE;
    const current = clean(raw);
    const next = action === "increase" ? current + STEP : action === "decrease" ? current - STEP : current;
    return applyReaderScale(next);
}

/**
 * @function loadFontSize
 * @description
 * Recalls the seeker's preferred scale and recreates every dependent variable.
 * @returns {string} Applied main font size.
 */
export function loadFontSize() {
    return applyReaderScale(localStorage.currentPostFontSize || DEFAULT_FONT_SIZE);
}
