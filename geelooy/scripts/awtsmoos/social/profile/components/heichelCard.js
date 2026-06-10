// B"H
/**
 * @module ProfileHeichelCard
 * @description Chapter 71: A Heichel card stays simple: name, role, open.
 */

import { el, clean } from "../dom.js";

export function heichelCard(item) {
    return el("article", { className: "profile-heichel-card" }, [
        el("div", { className: "heichel-seal", text: "♜" }),
        el("div", { html: `<h3>${clean(item.name)}</h3><p>${clean(item.description || "A public Heichel.")}</p><small>${clean(item.role)}</small>` }),
        el("a", { text: "Open", attrs: { href: `/heichelos/${encodeURIComponent(item.id)}` } })
    ]);
}
