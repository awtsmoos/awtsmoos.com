/**
 * B"H
 * @module DOMManifestor
 * @description
 * The Awtsmoos speaks structure into the DOM through data. This manifestor now
 * refuses casual raw HTML: ordinary plans become text, attributes, and children.
 * Only an explicitly marked trustedHTML vessel may use innerHTML, so heichel
 * descriptions cannot leak script tags into visible reality.
 */

const ATTRIBUTE_MAP = {
    className: "class",
    href: "href",
    id: "id",
    title: "title",
    role: "role",
    type: "type"
};

function setKnownAttributes(el, plan) {
    Object.entries(ATTRIBUTE_MAP).forEach(([key, attr]) => {
        if (plan[key] !== undefined && plan[key] !== null) el.setAttribute(attr, String(plan[key]));
    });
}

function setDataset(el, dataset) {
    if (!dataset || typeof dataset !== "object") return;
    Object.entries(dataset).forEach(([key, value]) => {
        if (value !== undefined && value !== null) el.dataset[key] = String(value);
    });
}

function setEvents(el, events) {
    if (!events || typeof events !== "object") return;
    Object.entries(events).forEach(([name, handler]) => {
        if (typeof handler === "function") el.addEventListener(name, handler);
    });
}

export class DOMManifestor {
    /**
     * Recursively builds a DOM node from a data plan.
     * @param {object|string|number} plan Manifestation blueprint.
     * @returns {Node} Created DOM node.
     */
    static create(plan) {
        if (typeof plan === "string" || typeof plan === "number") return document.createTextNode(String(plan));
        if (!plan || !plan.tag) return document.createTextNode("");

        const el = document.createElement(plan.tag);
        setKnownAttributes(el, plan);
        setDataset(el, plan.dataset);
        setEvents(el, plan.events);
        if (typeof plan.onclick === "function") el.addEventListener("click", plan.onclick);

        if (plan.text !== undefined) el.textContent = String(plan.text);
        if (plan.innerText !== undefined) el.textContent = String(plan.innerText);
        if (plan.innerHTML !== undefined) el.textContent = String(plan.innerHTML);
        if (plan.trustedHTML !== undefined) el.innerHTML = String(plan.trustedHTML);

        if (Array.isArray(plan.children)) {
            plan.children.forEach(child => el.appendChild(this.create(child)));
        }

        return el;
    }
}
