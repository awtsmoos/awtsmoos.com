
/**
 * B"H
 * 
 * THE YICHUD (UNIFICATION) INTERACTION SYSTEM
 * 
 * TIKKUN: Raycasting every single mouse movement pixel is a sin against performance.
 * We now throttle the gaze of the soul. It updates 10 times a second, which is 
 * plenty fast for human perception, but infinitely lighter on the processor.
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
        this.olam = olam;
        this.kav = new Kav(olam);
        this.ohr = new Ohr();
        this.peula = new Peula(olam);
        this.currentIntersection = null;
        
        // B"H: The Anchor of Time
        this.lastHoverUpdate = 0;

        this.init();
    }

    /**
     * @method init
     * @description Binds the sacred events of the physical realm (DOM).
     */
    init() {
        if (typeof window !== 'undefined') {
            window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        }
    }

    handleMouseMove(e) {
        this.handleEvent(e, false);
    }

    handleMouseDown(e) {
        this.handleEvent(e, true);
    }

    /**
     * @method handleEvent
     * @description Receives event data from the worker router.
     */
    handleEvent(payload, isClick = false) {
        if (!this.olam.canvas && !this.olam.renderer) return;
        
        let x, y;
        if (payload.x !== undefined && payload.y !== undefined) {
             x = payload.x;
             y = payload.y;
        } else {
             const rect = { width: this.olam.width || 1920, height: this.olam.height || 1080 };
             x = (payload.clientX / rect.width) * 2 - 1;
             y = -(payload.clientY / rect.height) * 2 + 1;
        }
        
        // B"H: Throttle hovers, but ALWAYS process clicks immediately!
        const now = Date.now();
        if (isClick || (now - this.lastHoverUpdate > 100)) {
            this.lastHoverUpdate = now;
            this.update(x, y);
        }

        if (isClick && this.currentIntersection) {
            this.peula.execute(this.currentIntersection);
        }
    }

    /**
     * @method update
     * @description Refreshes the state of unification.
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

    onHoverEnter() {
        if (!this.currentIntersection) return;
        const { nivra, mesh } = this.currentIntersection;
        if (!nivra) return;
        
        const hasInteractFlag = nivra.interactable || (nivra.options && nivra.options.interactable);
        const isKnownInteractiveType = (
            nivra.type === 'interactiveDoor' ||
            nivra.type === 'interactiveNpc' ||
            nivra.type === 'proceduralTree' ||
            nivra.type === 'customNpc'
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

    onHoverExit() {
        if (!this.currentIntersection) return;
        const { nivra, mesh } = this.currentIntersection;
        if (!nivra) return;
        
        const hasInteractFlag = nivra.interactable || (nivra.options && nivra.options.interactable);
        const isKnownInteractiveType = (
            nivra.type === 'interactiveDoor' ||
            nivra.type === 'interactiveNpc' ||
            nivra.type === 'proceduralTree' ||
            nivra.type === 'customNpc'
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
