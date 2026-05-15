
/**
 * B"H
 * THE HAND OF THE KING (INTERACTION CONTROLLER)
 * 
 * Chapter: The Quiet Observer
 * This controller intercepts the physical mouse movements.
 * During a Hover (`mousemove`), it calls `ScenePicker.pick` with `verbose = false`.
 * During a Click (`mousedown`), it calls with `verbose = true`.
 * This ensures the console remains clean and unburdened until true Malchus (action) occurs.
 * 
 * @module InteractionController
 */

import { ScenePicker, CameraUnprojector } from '../../physics/raycast/index.js';
import { VisibleRay } from './modules/visibleRay.js';
import { ColorHighlighter } from './modules/colorHighlighter.js';
import { InteractionLogger } from './modules/interactionLogger.js';

export class InteractionController {
    constructor(renderer) {
        this.renderer = renderer;
        this.canvas = renderer.canvas;
        this.hoveredObject = null;
    }

    enable() {
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onClick = this.onClick.bind(this);
        
        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('click', this._onClick);
        console.log('B"H - InteractionController: The Hand is open. Silence is maintained on hover.');
    }

    disable() {
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('click', this._onClick);
    }

    _getRay(e) {
        if (!this.renderer || !this.renderer.camera) return null;

        const rect = this.canvas.getBoundingClientRect();
        
        // CSS Pixels to NDC [-1, 1]
        const cssX = e.clientX - rect.left;
        const cssY = e.clientY - rect.top;
        const ndcX = (cssX / rect.width) * 2.0 - 1.0;
        const ndcY = 1.0 - (cssY / rect.height) * 2.0;
        
        return CameraUnprojector.unproject(ndcX, ndcY, this.renderer.camera);
    }

    onMouseMove(e) {
        const ray = this._getRay(e);
        if (!ray) return;

        // VERBOSE = FALSE -> Absolute Silence in the logs
        const result = ScenePicker.pick(ray, this.renderer.objectMap, this.renderer, false);
        const hitObj = result ? result.object : null;

        if (this.hoveredObject !== hitObj) {
            // Restore the old object
            if (this.hoveredObject) {
                ColorHighlighter.reset(this.hoveredObject);
                this.hoveredObject._isHovered = false;
            }
            
            // Highlight the new object
            this.hoveredObject = hitObj;
            if (hitObj) {
                hitObj._isHovered = true;
                ColorHighlighter.highlight(hitObj, [1.0, 0.8, 0.1]); // Hover Yellow
            }
        }

        // Only update the visual cylinder, do not log
        VisibleRay.draw(this.renderer, ray, result ? result.point : null);
    }

    onClick(e) {
        const ray = this._getRay(e);
        if (!ray) return;

        // VERBOSE = TRUE -> Loud, triumphant click evaluation
        const result = ScenePicker.pick(ray, this.renderer.objectMap, this.renderer, true);

        // Dump the grand manifestation log to the console
        InteractionLogger.logManifestation(this.canvas, e, ray, result, this.renderer.camera, this.renderer);

        if (result && result.object) {
            // Flash red on click
            ColorHighlighter.flash(result.object, [1.0, 0.1, 0.1], 180);
        }

        VisibleRay.draw(this.renderer, ray, result ? result.point : null);
    }
}
