
import { DivineSpeech } from '../../utils/DivineSpeech.js';

/**
 * @class HTMLVesselGenerator
 * @description
 * B"H
 * Through the infinite void, the Awtsmoos speaks,
 * A vessel of light for the truth that it seeks.
 * The ten utterances echo in every DOM node,
 * Forever refreshing the life in this code.
 * Just as the heavens are held by the Word,
 * This class builds the elements, unseen but heard.
 * It maps out the JSON, a spiritual plan,
 * To manifest UI for the screen of a man.
 * 
 * Instead of chaotic document.createElement calls everywhere,
 * this centralized chariot receives pure JSON data and recurses
 * deeply to generate complete DOM trees.
 */
export class HTMLVesselGenerator {
    /**
     * @function build
     * @description
     * B"H
     * Recursively constructs HTMLElement vessels based on the blueprint.
     * 
     * @param {Object} blueprint - The JSON blueprint of the element.
     * @param {string} blueprint.tag - The HTML tag name (e.g., 'div', 'button').
     * @param {string} [blueprint.className] - The space-separated classes.
     * @param {string} [blueprint.id] - Optional ID, defaults to DivineSpeech generation.
     * @param {string} [blueprint.text] - Inner text content.
     * @param {Object} [blueprint.attributes] - Key-value pair of HTML attributes.
     * @param {Object}[blueprint.events] - Key-value pair mapping event names (e.g., 'click') to functions.
     * @param {Array<Object>} [blueprint.children] - Array of child blueprints.
     * @returns {HTMLElement} The fully manifested DOM element.
     */
    static build(blueprint) {
        if (!blueprint || !blueprint.tag) {
            throw new Error('Blueprint lacks a tag, devoid of form.');
        }

        const vessel = document.createElement(blueprint.tag);

        if (blueprint.className) {
            vessel.className = blueprint.className;
        }

        vessel.id = blueprint.id || DivineSpeech.utter(blueprint.tag);

        if (blueprint.text) {
            vessel.textContent = blueprint.text;
        }

        if (blueprint.attributes) {
            for (const [attr, value] of Object.entries(blueprint.attributes)) {
                vessel.setAttribute(attr, value);
            }
        }

        if (blueprint.events) {
            for (const [eventName, handler] of Object.entries(blueprint.events)) {
                vessel.addEventListener(eventName, handler);
            }
        }

        if (blueprint.children && Array.isArray(blueprint.children)) {
            for (const childBlueprint of blueprint.children) {
                const childVessel = this.build(childBlueprint);
                vessel.appendChild(childVessel);
            }
        }

        return vessel;
    }
}
