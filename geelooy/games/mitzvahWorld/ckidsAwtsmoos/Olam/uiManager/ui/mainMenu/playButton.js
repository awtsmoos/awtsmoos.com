
/**
 * B"H
 * @module playButton
 * @description
 * The spark of action! The exact moment the soul dives into the body.
 * In this intense iteration, we strip away all external illusions (Firebase, complex GLBs).
 * We manifest the world entirely from raw Javascript object data, ensuring absolute
 * stability. No undefined THREE objects. Just pure light and form.
 */

import mitzvahBtn from "../resources/mitzvahBtn.js";

/**
 * @function playButton
 * @description Creates the button that launches a fresh, dynamic world directly from nothingness.
 * @param {Object} gameUiHTML - The overarching UI schema to bind to the world.
 * @returns {Object} The fully formed Mitzvah Button configuration.
 */
export default function playButton(gameUiHTML) {
    return mitzvahBtn({
        text: "Play: Enter the Pure Void",
        onclick(e, $, ui) {
            console.log("B\"H - ⚡ INTENSE LOG: Play Button Clicked! Initiating stable direct object injection.");
            
            var ikar = e.target.af("ikar");
            if(!ikar) {
                console.error("B\"H - ⚡ INTENSE ERROR: Could not find 'ikar' element!");
                return;
            }
            
            // B"H: Pure Javascript Object. Absolute stability.
            var directWorldData = {
                shaym: "The Pure Void",
                components: {}, // No external components
                nivrayim: {
                    Domem: {
                        plane: {
                            name: "Infinite Emerald Plane",
                            golem: {
                                guf: { BoxGeometry: [500, 1, 500] },
                                toyr: { 
                                    MeshLambertMaterial: { 
                                        color: "#ffffff",
                                        map: "awtsmoosTex://basic" // Very basic procedural texture!
                                    } 
                                },
                                textureRepeat: { x: 50, y: 50 }
                            },
                            position: { x: 0, y: -0.5, z: 0 },
                            isSolid: true
                        },
                        heavenlyLight: {
                            name: "Divine Illumination",
                            golem: {
                                guf: { BoxGeometry: [0.1, 0.1, 0.1] },
                                toyr: { MeshBasicMaterial: { visible: false } }
                            },
                            on: {
                                ready(lightObj) {
                                    // B"H: Avoid using 'new THREE.Color' to prevent scope errors!
                                    // The background is already initialized as a Color object by Olam.
                                    if(lightObj.olam && lightObj.olam.scene && lightObj.olam.scene.background) {
                                        lightObj.olam.scene.background.setHex(0x87CEEB); // Sky blue!
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
                            // B"H: Using the new requested URL!
                            path: "https://models-3122d.web.app/chossid.glb",
                            position: { x: 0, y: 15, z: 0 },
                            on: {
                                "hit floor": function(m) {
                                    m.olam.ayshPeula("ui event", "effectsOverlay", { text: "Landed in Reality!", color: "#00ffed" });
                                }
                            }
                        }
                    }
                }
            };

            console.log("B\"H - ⚡ INTENSE LOG: Dispatching 'start' event with directWorldData.");

            ikar.dispatchEvent(
                new CustomEvent("start", {
                    detail: {
                        worldDayuh: directWorldData, 
                        gameUiHTML: gameUiHTML
                    }
                })
            );
            
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
