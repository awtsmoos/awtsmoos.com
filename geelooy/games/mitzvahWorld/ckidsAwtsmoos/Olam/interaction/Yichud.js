/**
 * B"H
 * 
 * THE YICHUD (UNIFICATION) INTERACTION SYSTEM
 * 
 * In the beginning, there was the Ein Sof, the Infinite Light, unified and singular.
 * To create a world of "Otherness," the Awtsmoos spoke a word of concealment,
 * but within every creation, a spark of that original Unification remains.
 * 
 * This module, Yichud, is the sacred bridge. It is the vessel that connects
 * the Will of the Observer (the player) with the Essence of the Observed (the objects).
 * When the eye of the soul (the camera) casts its ray (the Kav) into the void,
 * it seeks a point of contact, a moment of Yichud, where the many become One.
 * 
 * Every click is a prayer, every hover a revelation of the hidden Light.
 * 
 * @module Yichud
 */

import Kav from "./methods/Kav.js";
import Ohr from "./methods/Ohr.js";
import Peula from "./methods/Peula.js";

/**
 * @class Yichud
 * @description The master orchestrator of all worldly interactions.
 */
export default class Yichud {
    /**
     * @constructor
     * @param {Object} olam - The Olam (world) context.
     */
    constructor(olam) {
        /**
         * @property {Object} olam
         * @description The container of all existence.
         */
        this.olam = olam;

        /**
         * @property {Kav} kav
         * @description The primordial ray of intention.
         */
        this.kav = new Kav(olam);

        /**
         * @property {Ohr} ohr
         * @description The light that highlights the hidden essence.
         */
        this.ohr = new Ohr();

        /**
         * @property {Peula} peula
         * @description The action dispatcher that translates intent into deed.
         */
        this.peula = new Peula(olam);

        /**
         * @property {Object|null} currentIntersection
         * @description The present point of contact between observer and observed.
         */
        this.currentIntersection = null;

        this.init();
    }

    /**
     * @method init
     * @description Binds the sacred events of the physical realm (DOM).
     */
    init() {
        // Unification of mouse and mind
        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        }
    }

    /**
     * @method handleMouseMove
     * @description Bridges the physical mouse movement to the spiritual Kav.
     */
    handleMouseMove(e) {
        this.handleEvent(e, false);
    }

    /**
     * @method handleMouseDown
     * @description Bridges the physical mouse click to the spiritual Peula.
     */
    handleMouseDown(e) {
        this.handleEvent(e, true);
    }

    /**
     * @method handleEvent
     * @description Receives event data from the worker router.
     * @param {Object} payload - The event payload.
     * @param {boolean} isClick - Whether this is a click event.
     */
    handleEvent(payload, isClick = false) {
        if (!this.olam.canvas && !this.olam.renderer) return;
        
        // Use normalized coordinates if provided, or calculate them
        let x, y;
        if (payload.x !== undefined && payload.y !== undefined) {
             x = payload.x;
             y = payload.y;
        } else {
             const rect = { width: this.olam.width || 1920, height: this.olam.height || 1080 };
             x = (payload.clientX / rect.width) * 2 - 1;
             y = -(payload.clientY / rect.height) * 2 + 1;
        }
        
        this.update(x, y);

        if (isClick && this.currentIntersection) {
            this.peula.execute(this.currentIntersection);
        }
    }

    /**
     * @method update
     * @description Refreshes the state of unification every frame.
     * @param {number} x - Normalized mouse X.
     * @param {number} y - Normalized mouse Y.
     */
    update(x, y) {
        const hit = this.kav.cast(x, y);
        
        if (hit) {
            if (this.currentIntersection?.nivra !== hit.nivra) {
                this.onHoverExit();
                this.currentIntersection = hit;
                this.onHoverEnter();
            }
        } else {
            this.onHoverExit();
            this.currentIntersection = null;
        }
    }

    /**
     * @method onHoverEnter
     * @description When the Kav strikes a Nivra, the Ohr reveals its name and nature.
     */
    onHoverEnter() {
        if (!this.currentIntersection) return;
        const { nivra, mesh } = this.currentIntersection;
        
        if (!nivra) return;
        
        // B"H: Determine if this entity should respond to hover
        const hasInteractFlag = nivra.interactable || (nivra.options && nivra.options.interactable);
        const isKnownInteractiveType = (
            nivra.type === 'interactiveDoor' ||
            nivra.type === 'interactiveNpc' ||
            nivra.type === 'proceduralTree'
        );
        const isNotNoise = nivra.type !== 'proceduralFlowerPatch' && nivra.type !== 'proceduralTerrain';

        if ((hasInteractFlag || isKnownInteractiveType) && isNotNoise) {
            this.ohr.highlight(mesh, true);
            this.olam.ayshPeula("interactionHover", nivra);
            if (nivra.ayshPeula) nivra.ayshPeula("mouseEnter");
            
            if (typeof document !== 'undefined') {
                document.body.style.cursor = "pointer";
            }
        }
    }

    /**
     * @method onHoverExit
     * @description When the Kav departs, the Ohr retreats, returning the object to its concealment.
     */
    onHoverExit() {
        if (!this.currentIntersection) return;
        const { nivra, mesh } = this.currentIntersection;
        
        if (!nivra) return;
        
        const hasInteractFlag = nivra.interactable || (nivra.options && nivra.options.interactable);
        const isKnownInteractiveType = (
            nivra.type === 'interactiveDoor' ||
            nivra.type === 'interactiveNpc' ||
            nivra.type === 'proceduralTree'
        );
        const isNotNoise = nivra.type !== 'proceduralFlowerPatch' && nivra.type !== 'proceduralTerrain';

        if ((hasInteractFlag || isKnownInteractiveType) && isNotNoise) {
            this.ohr.highlight(mesh, false);
            this.olam.ayshPeula("interactionExit", nivra);
            if (nivra.ayshPeula) nivra.ayshPeula("mouseLeave");
            
            if (typeof document !== 'undefined') {
                document.body.style.cursor = "default";
            }
        }
    }
}
