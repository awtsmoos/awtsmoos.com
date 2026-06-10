// B"H
/**
 * @module ProfileDrawer
 * @description Chapter 75: The side drawer appears only when summoned.
 */

import { el } from "../dom.js";

const links = [["Home", "/"], ["Heichelos", "/heichelos"], ["Series", "#tree"], ["Messages", "/email"], ["Notifications", "/notifications"], ["Settings", "/profile"]];

export function drawer(open) {
    return el("aside", { className: `profile-drawer ${open ? "open" : ""}` }, links.map(([label, href]) => el("a", { text: label, attrs: { href } })));
}
