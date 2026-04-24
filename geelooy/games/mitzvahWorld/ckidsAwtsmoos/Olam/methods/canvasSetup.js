
/**
 * B"H
 * 
 * methods related to initally setting up the main (and/or minimap) canvas(es)
 */

import * as THREE from '/games/scripts/build/three.module.js';

export default class {

    /** 
     * In the tale of Ayin's quest to illuminate the world,
     * The canvas is our stage, where the story is unfurled.
     * @param {HTMLCanvasElement} canvas - The stage where the graphics will dance.
     * @example
     * takeInCanvas(document.querySelector('#myCanvas'));
     */
    takeInCanvas(canvas, devicePixelRatio = 1) {
       
        if (!THREE.WebGLRenderer) {
            console.error("B\"H: Critical Error - THREE.WebGLRenderer is not available. Check Three.js import.");
            this.ayshPeula("error", {
                message: "THREE.WebGLRenderer could not be found in the worker. The game cannot start."
            });
            return; 
        }

        this.renderer = new THREE.WebGLRenderer({ 
			antialias: true, canvas,
			logarithmicDepthBuffer: true
		});
		
        // B"H: Enabling intense shadow map logic for basic HD finish
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // B"H: Enable nice tone mapping
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        if(!this.renderer.compute) this.renderer.compute = () => {}
        if(!this.renderer.renderAsync) {
		    this.renderer.clearAsync=this.renderer.clear;
            this.renderer.renderAsync = this.renderer.render;
        }
        
        this.renderer.setPixelRatio(devicePixelRatio);

        this.ayshPeula("canvased");
    }

    postprocessingSetup() {
        if(!this.postprocessing) return;
        this.postprocessing.postprocessingSetup();
    }

    postprocessingRender() {
        if(!this.postprocessing) return;
        return this.postprocessing.postprocessingRender();
    }

    adjustPostProcessing() {
        if(!this.postprocessing) return;
        this.postprocessing.setSize({ width: this.width, height: this.height });
    }

    /** 
     * As the eyes grow wider, or squint in the light,
     * Our view changes size, adjusting to the sight.
     */
    async setSize(vOrWidth={}, height, sameAspect = false) {
        let width;

        if(typeof vOrWidth === "number") {
            width = vOrWidth;
        } else if (typeof vOrWidth === "object") {
            ({width, height} = vOrWidth);
        }

        var desiredAspectRatio = this.ASPECT_X / this.ASPECT_Y;
       
        let newWidth = width;
        let newHeight = height;

        if (width / height > desiredAspectRatio) {
            if(sameAspect) newWidth = height * desiredAspectRatio;
            if(this.rendered) {
                await this.ayshPeula("htmlAction", {
                    shaym: "main av",
                    methods: { classList: { remove: "sideInGame", add: "horizontalInGame" } }
                });
            }
        } else {
            if(this.rendered) {
                await this.ayshPeula("htmlAction", {
                    shaym: "main av",
                    methods: { classList: { add: "sideInGame", remove: "horizontalInGame" } }
                });
            }
            if(sameAspect) newHeight = width / desiredAspectRatio;
        }

        this.width = newWidth;
        this.height = newHeight;
		
        width = newWidth;
        height = newHeight;
        
        if(typeof width === "number" && typeof height === "number" ) {
            if(this.renderer) {
                this.renderer.setSize(width, height, false);
            } 
            
            await this.updateHtmlOverlaySize(width, height, desiredAspectRatio);
            await this.getBoundingRect();

            this.adjustPostProcessing();
        }

        this.refreshCameraAspect();
    }

    async getBoundingRect() {
        var info = await this.ayshPeula("htmlAction", {
            shaym: "ikarGameMenu",
            methods: { getBoundingClientRect: true }
        });

        if(info[0]) {
            var rect = info[0]?.methodsCalled?.getBoundingClientRect;
            if(rect) this.boundingRect = rect;
        }
    }
    
    async updateHtmlOverlaySize(width, height) {
        await this.ayshPeula("htmlAction", {
            shaym: `main av`,
            properties: { style: { width:width+"px", height:height+"px" } }
        });

        if(this.rendered) 
            await this.ayshPeula("htmlAction", {
                shaym: `av`,
                properties: { style: { width:width+'px', height:height+'px' } }
            });
    }
}
