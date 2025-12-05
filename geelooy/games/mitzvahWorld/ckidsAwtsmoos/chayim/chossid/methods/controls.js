/**
 * B"H
 * @file controls.js
 * Input handling for the Chossid (Player).
 */

const ACTION_TOGGLE = "KeyB";
const ACTION_SELECT = "Enter";
const CAMERA_PAN_UP = "KeyR";
const CAMERA_PAN_DOWN = "KeyF";
const CAMERA_FPS_TOGGLE = "KeyT";
var isInEditorMode = false;

export default {
    controls(deltaTime) {
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
        // Placeholder for future sound logic
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

        // Check if the key pressed is a number between 1 and 9
        if (k >= 1 && k <= 9) {
            var num = parseInt(k, 10);
            this.interactingWith?.toggleToOption?.(num - 1);
        }
    },

    setupInputListeners(olam) {
        var isOtherview = false;
        olam.on("keypressed", async k => {
            this.ayshPeula("keypressed", k);
            this.dialogueControls(k);
            switch(k.code) {
                case "KeyR":
                    this.rotatePreview();
                    break;
                
                case "KeyQ":
                    this.resetPreviewRotation();
                    break;
                
                case "NumLock":
                    this.movingAutomatically = !this.movingAutomatically;
                    break;

                case "KeyY":
                    await this.makeRay(this.rayLength);
                    if(!this.activeRay) {
                        this.removeIntersected();
                    }
                    break;

                case "KeyG":
                    isInEditorMode = !isInEditorMode;
                    break;

                case ACTION_TOGGLE:
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
                    // B"H: Prioritize active dialogue interactions over world block selection.
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
    }
};