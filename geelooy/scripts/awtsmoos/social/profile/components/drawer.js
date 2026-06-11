// B"H
/**
 * @module ProfileDrawer
 * @description
 * Chapter 99: The three-bar menu becomes a real mobile drawer with a veil and
 * close button, not a half-open slab that leaves the page visually broken.
 */

import { el } from "../dom.js";

const links = [
    ["Home", "/"],
    ["Heichelos", "/heichelos"],
    ["Series", "/heichelos"],
    ["Messages", "/email"],
    ["Notifications", "/notifications"],
    ["Settings", "/profile"]
];

export function drawer(open, onClose) {
    return el("section", { className: `profile-drawer-layer ${open ? "open" : ""}`, attrs: { "aria-hidden": open ? "false" : "true" } }, [
        el("button", { className: "profile-drawer-veil", attrs: { type: "button", "aria-label": "Close menu" }, on: { click: onClose } }),
        el("aside", { className: "profile-drawer" }, [
            el("header", { className: "profile-drawer-head" }, [
                el("strong", { text: "GEELOOY" }),
                el("button", { text: "×", attrs: { type: "button", "aria-label": "Close menu" }, on: { click: onClose } })
            ]),
            ...links.map(([label, href]) => el("a", { text: label, attrs: { href } }))
        ])
    ]);
}
