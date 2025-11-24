/**
 * B"H
 * 
 * events for showing or hiding labels 
 * when hovering over dynamic objects in game
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default function() {
    this.pointer = new THREE.Vector2();
    var intersected = null;
    var hoveredLabel = false;

    this.on("hide label", async () => {
        await this.htmlAction({
            shaym: "minimap label",
            properties: {
                innerHTML: "",
                style: {
                    
                    transform:`translate(${-1e4}px, ${
                        -1e4
                    }px)`
                }
            },
            
            methods: {
                classList: {
                    add: "invisible"
                }
            }
        })
    })

    const mouseMove = async peula => {
        if(!this.boundingRect) {
            return;
        }
        if(peula) {
            this.achbar.x = peula.clientX;
            this.achbar.y = peula.clientY;
        }
        var {
            left,
            top,
            width,
            height
        } = this.boundingRect
        if(peula) {
            this.pointer.x = ((peula.clientX - left) / width) * 2 -1;
            this.pointer.y = -(
                (peula.clientY - top) / height
            ) * 2 + 1;
        }
        if(this.mouseDown) {
            this.ayin.onMouseMove(peula);
        }
        /**
         * as mouse moves check if any objects 
         * are being hovered over
         */
        

    };
    this.on("mousemove", mouseMove);

    
}