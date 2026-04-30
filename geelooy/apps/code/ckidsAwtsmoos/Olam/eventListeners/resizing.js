
// B"H
/**
 * @module ResizingListener
 * @description
 * * Chapter 7: The Expansion of the Kav (Line)
 * As the physical boundaries of the window shift, the measurements 
 * of the Olam must follow. This listener ensures the light perfectly
 * fills the vessel of the browser window.
 * * It also acts as the final trigger for the 'Game Start' sequence.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default function() {
    var setSizeOnce = false;
    this.rendered = false;

    this.on("resize", async peula => {
        if (this.rendered) {
            await this.setSize(peula.width, peula.height, false);
            if (peula.devicePixelRatio) {
                this.pixelRatio = peula.devicePixelRatio;
            }
        }
        
        if (!setSizeOnce && this.rendered) {
            console.log("B\"H - 🌌 Olam stabilized. Signalling readiness.");
            this.ayshPeula("ready to start game");
            setSizeOnce = true;
        }

        if (this.minimap) this.minimap.resize();
    });

    /**
     * @event rendered first time
     * @description Fired by the render loop when the first pixel of light strikes the canvas.
     */
    this.on("rendered first time", async () => {
        console.log("B\"H - ✨ Genesis confirmed. The first frame has been manifest.");
        this.rendered = true;

        if (this.renderer) this.renderer.renderedOnce = true;

        // Force a resize calculation to align all vessels
        var windowSize = await this.ayshPeula("get window size");
        if (Array.isArray(windowSize)) windowSize = windowSize[0];
        
        if (windowSize) {
            await this.ayshPeula("resize", {
                width: windowSize.width,
                height: windowSize.height  
            });
        }
        
        // THE CRITICAL SIGNAL: Tell the UI to hide the loading screen!
        console.log("B\"H - 📢 Emitting hide loading screen signal.");
        await this.ayshPeula("hide loading screen");
        
        if (this.minimap) {
            await this.minimap.setMinimapItems(this.nivrayimWithShlichuseem, "Missions");
        }

        // Start all the entities
        for (var n of this.nivrayim) {
            await n.ayshPeula("started", n, this);
            if (typeof n.started === "function") await n.started();
        }
    });
}
