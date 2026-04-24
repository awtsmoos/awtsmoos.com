
/**
 * B"H
 * @module playButton
 * @description
 * The spark of action! Manifests the Emerald Void. 
 * Now with a high-stability procedural GPU grass shader.
 */

import mitzvahBtn from "../resources/mitzvahBtn.js";

export default function playButton(gameUiHTML) {
    return mitzvahBtn({
        text: "Play: Enter the Emerald Void",
        onclick(e, $, ui) {
            var ikar = e.target.af("ikar");
            if(!ikar) return;
            
            var directWorldData = {
                shaym: "The Pure Emerald Void",
                nivrayim: {
                    Domem: {
                        plane: {
                            name: "Infinite Emerald Plane",
                            golem: {
                                guf: { BoxGeometry: [1000, 1, 1000] },
                                toyr: { AwtsmoosGrassMaterial: {} } // Attempting the Shader!
                            },
                            position: { x: 0, y: -0.5, z: 0 },
                            isSolid: true
                        },
                        heavenlyLight: {
                            name: "Divine Illumination",
                            golem: { guf: { BoxGeometry: [0.1, 0.1, 0.1] }, toyr: { MeshBasicMaterial: { visible: false } } },
                            on: {
                                ready(lightObj) {
                                    if(lightObj.olam && lightObj.olam.scene && lightObj.olam.scene.background) {
                                        lightObj.olam.scene.background.setHex(0x87CEEB); 
                                    }
                                }
                            }
                        }
                    },
                    Chossid: {
                        me: {
                            height: 1.5,
                            name: "player",
                            speed: 160,
                            interactable: true,
                            path: "https://models-3122d.web.app/chossid.glb",
                            position: { x: 0, y: 15, z: 0 }
                        }
                    }
                }
            };

            ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: directWorldData, gameUiHTML: gameUiHTML } }));
            
            var ld = e.target.af("loading");
            if(ld) ld.classList.remove("hidden");

            var mm = e.target.af("main menu");
            if(mm) {
                mm.classList.add("hidden");
                mm.isGoing = false;
            }
        }
    });
}
