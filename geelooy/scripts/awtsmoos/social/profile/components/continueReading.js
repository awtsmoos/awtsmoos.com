// B"H
/**
 * @module ProfileContinueReading
 * @description Chapter 443: View history becomes a return staircase.
 */

import { el, clean, emptyCard } from "../dom.js";
import { historyCard } from "./historyCard.js";

export function continueReading(items = []) {
    const wrap = el("section", { className: "profile-continue-reading" }, [el("h2", { text: "Continue Reading" })]);
    if (!items.length) return el("section", { className: "profile-continue-reading" }, [emptyCard("No reading history yet.")]);
    items.slice(0, 6).forEach(item => wrap.appendChild(historyCard({ ...item, title: clean(item.title || item.id) })));
    return wrap;
}
