// B"H
/**
 * @file postLogic.js
 * @description
 * Chapter 297: The reader boots with two guardians.
 * One guardian repairs the single scroll vessel; the other catches wheel motion
 * over the letters themselves and pours it into that vessel, so the Torah river
 * flows under the mouse instead of only beside it.
 */

import { ignite } from "./logic/initialization/bootstrap.js";
import { repairReaderScrollVessel } from "./logic/scroll/ReaderScrollRepair.js";
import { bindReaderWheelBridge } from "./logic/scroll/ReaderWheelBridge.js";

function repairSoon() {
    repairReaderScrollVessel();
    bindReaderWheelBridge();
}

async function begin() {
    repairSoon();
    await ignite();
    repairSoon();
    [80, 350, 1200, 2400].forEach(delay => setTimeout(repairSoon, delay));
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", begin, { once: true });
} else {
    begin();
}
