
// B"H
import mitzvahBtn from "../resources/mitzvahBtn.js";

/**
 * @file playButton.js
 * @description
 * 🌿 CHAPTER 4: THE FLAWLESS DESCENT 🌿
 * 
 * "Let there be light," and there was NO TypeError!
 * When the Awtsmoos commands the sun to exist via the stringified `ready` function, 
 * it executes in a totally isolated Worker context where the global `THREE` object 
 * is hidden. We now perform a dynamic `import()` directly inside the manifestation 
 * block to securely draw down the THREE namespace.
 * 
 * The ground is emerald. The light is brilliant. The soul (Chossid) rests securely.
 * 
 * @returns {Object} The JSON UI element that triggers the Genesis.
 */
export default function playButton(gameUiHTML) {
    return mitzvahBtn({
        text: "Play: Chossid on the Green Earth",
        onclick(e, $, ui, me) {
            const ikar = $("ikar");
            const loadingScreen = $("loading");
            const menuScreen = $("main menu");

            if (!ikar) return;

            console.log("B\"H - ⚡ ABSOLUTE GENESIS: Initiating the Pure Green Reality with the Chossid...");

            const worldData = {
                shaym: "Chossid_Emerald_Reality",
                nivrayim: {
                    Domem:[
                        {
                            name: "Giant Green Plane",
                            golem: {
                                guf: { BoxGeometry:[2000, 4, 2000] },
                                toyr: { MeshStandardMaterial: { color: "#1a7a25", roughness: 0.9, metalness: 0.05 } }
                            },
                            // Positioned so the top surface is exactly at Y=0
                            position: { x: 0, y: -2, z: 0 },
                            isSolid: true,
                            on: {
                                ready(n) {
                                    console.log('B"H - 🌍 GROUND MANIFESTED! Attempting to draw down the WebGL Grass Shader...');
                                    try {
                                        import('/games/mitzvahWorld/ckidsAwtsmoos/utils/3d/procedural/Shaders/Grass/index.js')
                                            .then(module => {
                                                if (module && module.default && typeof module.default.apply === 'function') {
                                                    module.default.apply(n.mesh.material);
                                                    n.mesh.material.needsUpdate = true;
                                                    console.log('B"H - 🌿 WebGL Grass Shader successfully compiled and applied to the earth!');
                                                } else {
                                                    console.warn('B"H - ⚠️ Grass module found but lacking application method. Earth remains solid green.');
                                                }
                                            })
                                            .catch(err => {
                                                console.warn('B"H - ⚠️ WebGL Grass Shader module missing or shattered. Falling back to solid Emerald Green.', err);
                                            });
                                    } catch (e) {
                                        console.warn('B"H - ⚠️ WebGL Grass Shader exception. Falling back to solid Emerald Green.', e);
                                    }
                                }
                            }
                        },
                        {
                            name: "Intense Sun",
                            golem: { guf: { BoxGeometry:[2, 2, 2] }, toyr: { MeshBasicMaterial: { color: "#ffffff" } } },
                            position: { x: 50, y: 150, z: 50 },
                            on: {
                                ready(n) {
                                    // B"H: DYNAMIC IMPORT TIKKUN!
                                    // We fetch THREE locally inside the isolated evaluation to guarantee its existence!
                                    import('/games/scripts/build/three.module.js').then(THREE => {
                                        if (n.olam && n.olam.scene) {
                                            const light = new THREE.DirectionalLight(0xffffff, 3.5);
                                            light.position.set(50, 150, 50);
                                            light.castShadow = true;
                                            n.olam.scene.add(light);
                                            
                                            const ambient = new THREE.AmbientLight(0x404040, 2.5);
                                            n.olam.scene.add(ambient); 
                                            
                                            console.log('B"H - ☀️ SUN MANIFESTED! Brilliant light pours onto the earth without crashing.');
                                        }
                                    }).catch(err => {
                                        console.error('B"H - 🚨 THE LIGHT FAILED TO DESCEND:', err);
                                    });
                                }
                            }
                        }
                    ],
                    Chossid:[
                        {
                            name: "The Chossid",
                            height: 1.5,
                            speed: 180,
                            interactable: true,
                            // B"H: The true vessel! Drawn down from the high servers!
                            path: "https://models-3122d.web.app/chossid.glb",
                            // Dropped from the heavens to land on the green earth
                            position: { x: 0, y: 15, z: 0 },
                            on: {
                                ready(n) {
                                    console.log("B\"H - 📦 CHOSSID MANIFESTED! The true soul has descended into the physical engine.");
                                    if(n.updateAppearance) n.updateAppearance();
                                },
                                "hit floor": function(m) {
                                    if(m.olam) {
                                        m.olam.ayshPeula("ui event", "effectsOverlay", { text: "TOUCHDOWN ON THE GREEN EARTH!", color: "#00ffff" });
                                    }
                                    console.log("B\"H - 💥 BOOM! The Chossid has made contact with the Green Plane.");
                                }
                            }
                        }
                    ]
                }
            };

            // Tear away the menus
            if (menuScreen) {
                menuScreen.classList.add("hidden");
                menuScreen.isGoing = false; 
            }
            
            if (loadingScreen) {
                loadingScreen.classList.remove("hidden");
                loadingScreen.style.display = "flex";
            }

            console.log("B\"H - ⚡ Signal sent: Chossid Emerald Foundation Dispatched.");
            
            ikar.dispatchEvent(new CustomEvent("start", { 
                detail: { worldDayuh: worldData, gameUiHTML } 
            }));
        }
    });
}
