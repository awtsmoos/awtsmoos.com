// B"H
/**
 * @module ProfileBottomNav
 * @description Chapter 74: Thumb navigation keeps the mobile page clean.
 */

import { el } from "../dom.js";

const links = [
    ["Home", "/"],
    ["Tree", "#tree"],
    ["+", "/heichelos/submit"],
    ["Inbox", "/email"],
    ["Profile", "/profile"]
];

export function bottomNav() {
    return el("nav", { className: "profile-bottom-nav" }, links.map(([label, href]) => el("a", { text: label, attrs: { href } })));
}
