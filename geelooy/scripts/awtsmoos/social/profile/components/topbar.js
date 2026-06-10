// B"H
/**
 * @module ProfileTopbar
 * @description Chapter 65: A compact crown bar opens the mobile profile gate.
 */

import { el } from "../dom.js";

export function topbar(onMenu) {
    return el("header", { className: "profile-topbar" }, [
        el("button", { className: "profile-icon-btn", text: "☰", attrs: { type: "button", "aria-label": "Menu" }, on: { click: onMenu } }),
        el("div", { className: "profile-brand", html: "<strong>GEELOOY</strong><small>The Social Sanctuary</small>" }),
        el("a", { className: "profile-icon-btn", text: "◌", attrs: { href: "/notifications", "aria-label": "Notifications" } })
    ]);
}
