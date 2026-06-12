
// B"H
/**
 * @module ResizingListener
 * @description
 * 📐 CHAPTER 7: THE RECTIFICATION OF BOUNDS 📐
 * 
 * Chapter 701: The Emergence from the Womb.
 * 
 * "The earth was wide and long." 
 * 
 * When the world first manifests, there is a moment of total uncertainty. 
 * The worker doesn't know its container, and the container hasn't seen the light.
 * This listener catches the absolute SECOND the renderer pushes the first frame
 * and shouts it to the Heavens. 
 * 
 * THE STALLING RECTIFICATION:
 * We have removed the "await get window size" roadblock. 
 * It is better to have a slightly un-centered world for half a frame than to
 * remain frozen in a black screen forever!
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default function() {
    var setSizeOnce = false;
    this.rendered = false;

    this.on("resize", async peula => {
        // B"H: silent

        if (this.rendered) {
            await this.setSize(peula.width, peula.height, false);
            if (peula.devicePixelRatio) {
                this.pixelRatio = peula.devicePixelRatio;
            }
        }
        
        if (!setSizeOnce && this.rendered) {
            // B"H: silent

            this.ayshPeula("ready to start game");
            setSizeOnce = true;
        }

        if (this.minimap) this.minimap.resize();
    });

    /**
     * @event rendered first time
     * @description THE MOMENT THE EYES OPEN!
     */
    this.on("rendered first time", async () => {
        // B"H: silent

        this.rendered = true;

        if (this.renderer) this.renderer.renderedOnce = true;

        // B"H: The Big Fix. 
        // Do NOT await the window size here. We have already passed dimensions in pawsawch.
        // Awaiting a cross-thread call that hasn't been promised correctly results in 
        // eternal suspension.
        
        // B"H: silent

        // Non-blocking trigger. Let the UI handle it!
        this.ayshPeula("hide loading screen");
        
        if (this.minimap) {
            // B"H: silent

            await this.minimap.setMinimapItems(this.nivrayimWithShlichuseem, "Missions");
        }

        // Ignite the spiritual logic of every descended soul.
        // B"H: silent

        for (var n of this.nivrayim) {
            // Scene decoration can share the nivrayim ledger without sharing
            // the event-emitter covenant. Only living event vessels are called.
            if (typeof n?.ayshPeula === "function") {
                n.ayshPeula("started", n, this);
            }
            if (typeof n.started === "function") {
                await n.started();
            }
        }
        
        // Ensure a final resize pulse matches our viewport perfectly
        this.ayshPeula("ready to start game");
    });
}
