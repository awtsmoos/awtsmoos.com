
/**
 * B"H
 * Listens for the impulses of the player, translated from the physical keypress to the spiritual event.
 */
import PointerUpdater from "../methods/interaction/PointerUpdater.js";

export default function() {
    var c;
    this.on("keydown", peula => {
        c = peula.code;
        if(!this.keyStates[peula.code]) {
            this.ayshPeula("keypressed", peula);
        }
        this.keyStates[peula.code] = true;
        
        if(this.keyBindings[c]) {
            this.inputs[this.keyBindings[c]] = true;
        }
    });

    this.on("setInput", peula => {
        var c = peula.code;
        if(this.keyBindings[c]) {
            this.inputs[this.keyBindings[c]] = true;
        }
    })

    this.on("setInputOut", peula => {
        var c = peula.code;
        if(this.keyBindings[c]) {
            this.inputs[this.keyBindings[c]] = false;
        }
    })

    this.on("keyup", peula => {
        c = peula.code;
        this.keyStates[peula.code] = false;

        if(this.keyBindings[c]) {
            this.inputs[this.keyBindings[c]] = false;
        }
    });

    this.on("presskey", peula => {
        // B"H: silent

    })

    this.on("mousedown", peula => {
        // B"H: The immediate alignment of the gaze!
        // Before we process the click, we MUST update the pointer coordinates
        // so that any subsequent interaction checks know exactly where to look.
        if (peula.clientX !== undefined && peula.clientY !== undefined) {
            PointerUpdater.update(this, peula.clientX, peula.clientY);
        }

        this.ayin.onMouseDown(peula);
        this.mouseDown = true;
    });

    this.on("mouseup", peula => {
        this.ayshPeula("mouseRelease", true);
        this.ayin.onMouseUp(peula);
        this.mouseDown = false;
    });

    // B"H: The Universal Zoom Hub!
    this.on("wheel", peula => {
        if (this.ayin && typeof this.ayin.zoom === 'function') {
            this.ayin.zoom(peula.deltaY);
        }
    });
}
