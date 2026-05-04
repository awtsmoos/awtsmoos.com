
/**
 * B"H
 * @file controls.js
 * Input handling for the Chossid (Player).
 * Capturing the physical actions of the hands (keyboard/mouse) and reflecting them
 * into the spiritual matrix (world actions).
 */

const ACTION_TOGGLE = "KeyC";
const ACTION_SELECT = "Enter";
const ATTACK_KEY = "KeyF"; 
const CAMERA_PAN_UP = "KeyR";
const CAMERA_PAN_DOWN = "KeyZ"; 
const CAMERA_FPS_TOGGLE = "KeyT";
const DISMOUNT_KEY = "KeyX";
const EDITOR_TOGGLE = "KeyG";

export default {
    controls(deltaTime) {
        if (this.isDriving && this.drivingVehicle) {
            if (this.olam.keyStates[DISMOUNT_KEY]) {
                 this.drivingVehicle.dismount();
                 return;
            }
            return; 
        }

        this.resetMoving();

        if(this.olam.showingImportantMessage) return;

        if(this.olam.inputs.RUNNING) {
            this.moving.running = true;
        }

        if (this.olam.inputs.FORWARD) this.moving.forward = true;
        if (this.olam.inputs.BACKWARD) this.moving.backward = true;
        if (this.olam.inputs.DOWN) this.moving.down = true;
        if (this.olam.inputs.UP) this.moving.up = true;
        
        if (this.olam.inputs.LEFT_ROTATE) this.moving.turningLeft = true;
        if (this.olam.inputs.RIGHT_ROTATE) this.moving.turningRight = true;

        if (this.olam.inputs.LEFT_STRIDE) this.moving.stridingLeft = true;
        if (this.olam.inputs.RIGHT_STRIDE) this.moving.stridingRight = true;

        if(this.olam.inputs.JUMP) this.moving.jump = true;
        
        this.cameraControls();
        this.movingSounds();
    },

    movingSounds() {
    },

    cameraControls() {
        if(this.olam.keyStates[CAMERA_PAN_UP]) {
            this.olam.ayin.panUp();
        } else if(this.olam.keyStates[CAMERA_PAN_DOWN]) {
            this.olam.ayin.panDown();
        }
    },
    
    dialogueControls(e) {
        var k = e.key;
        if(!this.interactingWith) return;

        if (k >= 1 && k <= 9) {
            var num = parseInt(k, 10);
            if (typeof this.interactingWith.toggleToOption === 'function') {
                this.interactingWith.toggleToOption(num - 1);
            }
        }
    },

    setupInputListeners(olam) {
        olam.on("mousedown", (e) => {
            if (this.isInEditorMode) {
                 this.handleEditorClick(e);
                 return;
            }

            if (e.button === 0) { 
                if (this.handleClick) {
                    this.handleClick(e);
                } else {
                    this.shoot();
                }
            } else if (e.button === 2) { 
                 const item = this.getActiveItem();
                 if (item && item.altAction) {
                     item.altAction(); 
                 }
                 this.getRealActiveItemInstance(); 
            }
        });

        olam.on("keypressed", async k => {
            this.ayshPeula("keypressed", k);
            this.dialogueControls(k);
            
            switch(k.code) {
                case "KeyR": break;
                case "KeyQ": this.resetPreviewRotation(); break;
                case "NumLock": this.movingAutomatically = !this.movingAutomatically; break;

                case "KeyY":
                    await this.makeRay(this.rayLength);
                    if(!this.activeRay) {
                        this.removeIntersected();
                    }
                    break;

                case EDITOR_TOGGLE:
                    this.isInEditorMode = !this.isInEditorMode;
                    this.olam.ayshPeula("ui event", "effectsOverlay", { 
                        text: this.isInEditorMode ? "EDITOR MODE: ON" : "EDITOR MODE: OFF",
                        color: "#00ffed"
                    });
                    if (!this.isInEditorMode) {
                        this.olam.ayshPeula("ui event", "VisualEditor", { close: true });
                    }
                    break;
                
                case "KeyV": 
                    if (this.animations) {
                        const dance = this.animations.find(a => a.name.toLowerCase().includes("dance"));
                        if (dance) {
                            this.isDancing = !this.isDancing;
                            if(this.isDancing) this.playChaweeyoos("dance silly"); 
                            else this.playChaweeyoos(this.getChaweeyoos("idle"));
                        }
                    }
                    break;
                
                case ATTACK_KEY:
                    if (this.shootHebrewLetter) this.shootHebrewLetter();
                    break;
                
                case DISMOUNT_KEY:
                    if (this.isDriving && this.drivingVehicle) this.drivingVehicle.dismount();
                    break;

                case ACTION_TOGGLE:
                    const activeItem = this.getActiveItem();
                    if (activeItem && activeItem.isPainter) {
                        this.isPaintingMode = !this.isPaintingMode;
                        this.olam.ayshPeula("ui event", "effectsOverlay", { 
                            text: this.isPaintingMode ? "Painting Mode: ON" : "Painting Mode: OFF",
                            color: this.isPaintingMode ? "#00ff00" : "#ff0000"
                        });
                        return; 
                    }

                    // B"H: Universal interaction router!
                    // 'this.approachedEntities' holds a stack of objects our proximity circle is touching.
                    // This includes InteractiveDoors, Chests, and NPCs!
                    if(!this.interactingWith) {
                        const targetVessel = this.approachedEntities[0];
                        
                        if(!targetVessel) {
                            if(!this.selected) {
                                // Default back to building/tool logic if holding an item and not near an NPC
                                this.shoot(); 
                            } else {
                                this.toggleSelectedMenu();
                            }
                            return;
                        }
                        
                        // Fire the universal accepted connection event onto the vessel
                        // B"H: silent

                        targetVessel.ayshPeula("accepted interaction", this);
                        return;
                    }
                    
                    // If already deep in dialogue, toggle through options.
                    if (typeof this.interactingWith.toggleOption === 'function') {
                        this.interactingWith.toggleOption();
                    }
                    break;

                case ACTION_SELECT:
                    if(this.selected) {
                        this.selectMenuOption();
                        return;
                    }
                    if(this.interactingWith) {
                        if (typeof this.interactingWith.selectOption === 'function') {
                            await this.interactingWith.selectOption();
                        }
                        return;
                    }
                    if(this.intersected) {
                        await this.selectIntersected();
                        return;
                    }
                    break;

                case CAMERA_FPS_TOGGLE: 
                    this.olam.ayin.isFPS = !this.olam.ayin.isFPS;
                    this.olam.ayshPeula("setFPS", this.olam.ayin.isFPS);
                    break;

                case "Space":
                    this.olam.ayshPeula("setInput", { code: "Space" });
                    setTimeout(() => {
                        this.olam.ayshPeula("setInputOut", { code: "Space" });
                    }, 50);
                    break;
                    
                case "Tab":
                    e.preventDefault();
                    if (this.approachedEntities.length > 1) {
                        // B"H: Cycle the stack!
                        const last = this.approachedEntities.shift();
                        this.approachedEntities.push(last);
                        
                        // Notify the new front entity it's now in focus
                        const newFocus = this.approachedEntities[0];
                        if (newFocus && typeof newFocus.ayshPeula === 'function') {
                            newFocus.ayshPeula("gained interaction focus", this);
                        }
                        // Notify the old front it lost focus
                        if (last && typeof last.ayshPeula === 'function') {
                            last.ayshPeula("lost interaction focus", this);
                        }
                        
                        // B"H: silent

                        if (newFocus && typeof newFocus._showInteractionPrompt === 'function') {
                            newFocus._showInteractionPrompt();
                        }
                    }
                    break;
                    
                default:;
            }
        });
    },

    getRealActiveItemInstance() {
        const item = this.getActiveItem();
        if(!item) return null;
        if (item.className === 'ElementalStaff') {
             this.olam.ayshPeula("toolAltAction", item);
        }
    },
    
    handleEditorClick(e) {
        this.checkHover(this.olam, true); 
        if (this.intersected && this.intersected.niv) {
            const niv = this.intersected.niv;
            this.olam.ayshPeula("ui event", "VisualEditor", {
                objectSelected: {
                    id: niv.id, name: niv.name, type: niv.type,
                    position: niv.mesh.position, rotation: niv.mesh.rotation, scale: niv.mesh.scale
                }
            });
            this.setEntityHighlight(niv.mesh, true, 0x00ffed);
        }
    }
};
