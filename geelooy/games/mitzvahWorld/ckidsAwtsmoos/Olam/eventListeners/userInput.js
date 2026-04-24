
/**
 * B"H
 * Listens for the impulses of the player, translated from the physical keypress to the spiritual event.
 */

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
        console.log("Pressed a key~!" , peula)
        this.ayshPeula("keypressed", peula);
    })

    this.on("mousedown", peula => {
        // B"H: mouseLock is now handled strictly in the main thread (domEvents.js) to avoid NotAllowedError
        this.ayin.onMouseDown(peula);
        this.mouseDown = true;
    });

    this.on("mouseup", peula => {
        this.ayshPeula("mouseRelease", true);
        this.ayin.onMouseUp(peula);
        this.mouseDown = false;
    });
}
