
/**
 * B"H
 * @file controls.js
 * Input handling for the Chossid (Player).
 */

const ACTION_TOGGLE = "KeyB";
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
            this.interactingWith?.toggleToOption?.(num - 1);
        }
    },

    setupInputListeners(olam) {
        olam.on("mousedown", (e) => {
            // B"H: Editor Selection
            if (this.isInEditorMode) {
                 this.handleEditorClick(e);
                 return;
            }

            if (e.button === 0) { // Left Click
                if (this.handleClick) {
                    this.handleClick(e);
                } else {
                    this.shoot();
                }
            } else if (e.button === 2) { // Right Click (Alt Action)
                 const item = this.getActiveItem();
                 if (item && item.altAction) {
                     item.altAction(); // Trigger alt action on item wrapper if available
                 }
                 // If item is just data, checking logic:
                 const realItem = this.getRealActiveItemInstance(); // Need helper to get instance
                 if (realItem && realItem.altAction) realItem.altAction();
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
                    // Close editor UI if turning off
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
                    if (this.shootHebrewLetter) {
                        this.shootHebrewLetter();
                    }
                    break;
                
                case DISMOUNT_KEY:
                    if (this.isDriving && this.drivingVehicle) {
                        this.drivingVehicle.dismount();
                    }
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

                    if(!this.interactingWith) {
                        var npc = this.approachedEntities[0];
                        if(!npc) {
                            if(!this.selected) {
                                this.shoot(); 
                            } else {
                                this.toggleSelectedMenu();
                            }
                            return;
                        }
                        npc.ayshPeula("accepted interaction");
                        return;
                    }
                    this.interactingWith.toggleOption();
                    break;

                case ACTION_SELECT:
                    if(this.selected) {
                        this.selectMenuOption();
                        return;
                    }
                    if(this.interactingWith) {
                        await this.interactingWith.selectOption();
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
                    
                default:;
            }
        });
    },

    // B"H: Helper to find real instance for Alt Action
    getRealActiveItemInstance() {
        // This requires tracking instances or recreating. 
        // For Elemental Staff, we can assume if item className matches, we create temp or find cached.
        // Simplification: In worker, we just create a temp instance to call logic if needed, 
        // OR better, implement logic in 'shoot' variants.
        // But for switching modes, we need persistent state.
        // Let's attach state to the inventory item data in `inventory.js`.
        
        const item = this.getActiveItem();
        if(!item) return null;
        
        // If we have a cached class instance in a map?
        // For now, let's just use `item.customData` for state.
        if (item.className === 'ElementalStaff') {
             // Import dynamically or assume global access?
             // Best to move logic here or separate file.
             // We'll dispatch a custom event to world to handle tool logic centrally.
             this.olam.ayshPeula("toolAltAction", item);
        }
    },
    
    handleEditorClick(e) {
        this.checkHover(this.olam, true); // Update intersected
        if (this.intersected && this.intersected.niv) {
            const niv = this.intersected.niv;
            this.olam.ayshPeula("ui event", "VisualEditor", {
                objectSelected: {
                    id: niv.id,
                    name: niv.name,
                    type: niv.type,
                    position: niv.mesh.position,
                    rotation: niv.mesh.rotation,
                    scale: niv.mesh.scale
                }
            });
            this.setEntityHighlight(niv.mesh, true, 0x00ffed);
        }
    }
};
