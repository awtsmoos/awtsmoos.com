// B"H
/**
 * @module GenesisEngine
 * @description
 * Chapter 288: The scribe grows hands like roots under bark.
 *
 * Blueprints become DOM with minimal churn: children are gathered into a single
 * fragment before touching the live vessel, attributes are woven without
 * accidental false values, and event listeners are bound only to newly created
 * nodes. This is not magic performance; it is honest, practical stillness.
 */

import { DOMElements } from '../registry/dom-store.js';

export class ScribeOfManifestation {
    static speakElement(plan) {
        if (typeof plan === 'string' || typeof plan === 'number') {
            return document.createTextNode(String(plan));
        }
        if (!plan || !plan.tag) {
            console.warn('B"H - A blueprint without a tag is a shadow without a source.', plan);
            return document.createTextNode('');
        }

        const vessel = document.createElement(plan.tag);
        if (plan.attr) this.weaveAttributes(vessel, plan.attr);
        if (plan.events) this.igniteEvents(vessel, plan.events);
        if (Array.isArray(plan.children) && plan.children.length) {
            vessel.appendChild(this.speakChildren(plan.children));
        }
        if (plan.ref) DOMElements[plan.ref] = vessel;
        return vessel;
    }

    static manifest(plan) {
        return this.speakElement(plan);
    }

    static speakChildren(children) {
        const fragment = document.createDocumentFragment();
        for (const childPlan of children) {
            if (childPlan === null || childPlan === undefined || childPlan === false) continue;
            fragment.appendChild(this.speakElement(childPlan));
        }
        return fragment;
    }

    static weaveAttributes(vessel, attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            if (value === undefined || value === null || value === false) continue;
            if (key === 'style' && typeof value === 'object') {
                Object.assign(vessel.style, value);
                continue;
            }
            if (value === true) vessel.setAttribute(key, '');
            else vessel.setAttribute(key, String(value));
        }
    }

    static igniteEvents(vessel, events) {
        for (const [eventName, handler] of Object.entries(events)) {
            if (typeof handler === 'function') vessel.addEventListener(eventName, handler);
        }
    }
}
