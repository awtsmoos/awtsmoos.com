//B"H
/**
 * @file postLogic.js
 * Entry Point for the Revelation Reader.
 * Delegates to the Modular Bootstrap.
 */
import { ignite } from "./logic/initialization/bootstrap.js";

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ignite);
} else {
    ignite();
}