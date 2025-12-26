// B"H
/**
 * @file canvasSetup.js
 * Methods related to initally setting up the main (and/or minimap) canvas(es).
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class {

    /** 
     * In the tale of Ayin's quest to illuminate the world,
     * The canvas is our stage, where the story is unfurled.
     * @param {HTMLCanvasElement} canvas - The stage where the graphics will dance.
     * @param {number} devicePixelRatio - The clarity of the divine image.
     */
    takeInCanvas(canvas, devicePixelRatio = 1) {
       
        if (!THREE.WebGLRenderer) {
            console.error("B\"H: Critical Error - THREE.WebGLRenderer is not available. Check Three.js import.");
            this.ayshPeula("error", {
                message: "THREE.WebGLRenderer could not be found in the worker. The game cannot start."
            });
            return; 
        }

        try {
            // B"H: Proper initialization of the WebGL rendering context.
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                canvas: canvas,
                logarithmicDepthBuffer: true, 
                alpha: false,
                stencil: false,
                depth: true
            });
            
            if(!this.renderer.compute) this.renderer.compute = function() {}
            if(!this.renderer.renderAsync) {
                this.renderer.clearAsync = this.renderer.clear;
                this.renderer.renderAsync = this.renderer.render;
            }
            
            this.renderer.setPixelRatio(devicePixelRatio);
            
            if (canvas.width && canvas.height) {
                this.renderer.setSize(canvas.width, canvas.height, false);
                this.width = canvas.width;
                this.height = canvas.height;
            }

            console.log("B\"H - WebGL Renderer Initialized Successfully");
            this.ayshPeula("canvased");

        } catch(e) {
            console.error("B\"H - FATAL: Could not create WebGL Renderer.", e);
             this.ayshPeula("error", {
                message: "Failed to initialize WebGL Graphics. The hardware may be reaching its limits.",
                details: e.toString()
            });
        }
    }

    postprocessingSetup() {
        if(this.postprocessing && this.postprocessing.postprocessingSetup) {
             this.postprocessing.postprocessingSetup();
        }
    }

    postprocessingRender() {
        if(!this.postprocessing) return;
        return this.postprocessing.postprocessingRender();
    }

    adjustPostProcessing() {
        if(!this.postprocessing) return;

        this.postprocessing.setSize({
            width: this.width,
            height: this.height
        })
    }
    
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
                    methods: {
                        classList: {
                            remove: "sideInGame",
                            add: "horizontalInGame"
                        }
                    }
                });
            }
        } else {
            if(this.rendered) {
                await this.ayshPeula("htmlAction", {
                    shaym: "main av",
                    methods: {
                        classList: {
                            add: "sideInGame",
                            remove: "horizontalInGame"
                        }
                    }
                });
            }
            if(sameAspect) newHeight = width / desiredAspectRatio;
        }

        this.width = newWidth;
        this.height = newHeight;
		
        if(typeof this.width === "number" && typeof this.height === "number" ) {
            if(this.renderer) {
                this.renderer.setSize(this.width, this.height, false);
            }
            
            await this.updateHtmlOverlaySize(this.width, this.height, desiredAspectRatio);
            await this.getBoundingRect();
            this.adjustPostProcessing();
        }

        this.refreshCameraAspect();
    }

    async getBoundingRect() {
        var info = await this.ayshPeula("htmlAction", {
            shaym: "ikarGameMenu",
            methods: {
                getBoundingClientRect: true
            }
        });

        if(info && info[0]) {
            var rect = info[0]?.methodsCalled?.getBoundingClientRect;
            if(rect) {
                this.boundingRect = rect;
            }
        }
    }
    
    async updateHtmlOverlaySize(width, height) {
        await this.ayshPeula("htmlAction", {
                shaym: `main av`,
                properties: {
                    style: {
                        width:width+"px",
                        height:height+"px"
                    }
                }
        });
        
        if(this.rendered) {
            await this.ayshPeula("htmlAction", {
                shaym: `av`,
                properties: {
                    style: {
                        width:width+'px',
                        height:height+'px'
                    }
                }
            });
        }
    }
}
