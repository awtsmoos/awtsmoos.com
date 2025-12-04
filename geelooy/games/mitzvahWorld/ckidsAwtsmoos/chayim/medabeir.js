/**
 * B"H
 * 
 * Medabeir, that which speaks, is
 * a class representing NPCs in the game
 * that the player can have a dialogue with,
 * based on a dialogue tree system
 * where each resposne index leads to 
 * either another message, or an action
 * to be done.
 */

import Chai from "./chai.js";
import * as AWTSMOOS from "../awtsmoosCkidsGames.js";

export default class Medabeir extends Chai {
    type = "medabeir";
    /**
     * 
     * state mchanism of interactions..
     */
    _messageTree = [];
    _messageTreeFunction = null;
    _tempTree = null; // B"H: Temporary tree for dynamic UI states (like shops)

    state = "idle";
    garmentsDefault = {
        glasses: true,
        jacket: true,
        "top-hat": false,
    }
    
    wear(garmentName) {
        if(!this.garments) return;
        var gar = this?.garments?.[garmentName];
        if(gar) gar.visible = true;
    }
    
    takeoff(garmentName) {
        if(!this.garments) return;
        var gar = this?.garments?.[garmentName];
        if(gar) gar.visible = false;

    }
    /**
     * @property mood represents the "mood"
     * the character is in, currently
     * relevant for the mouth shape when talking.
     */
    mood = "neural"
    
    get messageTree() {
        // B"H: If a temporary tree exists (e.g. Shop UI), return it.
        if (this._tempTree) return this._tempTree;

        return typeof(this._messageTreeFunction) == "function" ? 
            this._messageTreeFunction(this) : this._messageTree;
    }

    set messageTree(v) {
        if(typeof(v) == "function") {
            this._messageTreeFunction = v;
            this._messageTree = this._messageTreeFunction(this);
        } else {
            this._messageTreeFunction = null;
            this._messageTree = v;
        }
    }

    goof = null;
    goofOptions = null;

 
    startTime = 0;
    currentTime = 0;


    nivraTalkingTo = null;
    currentMessageIndex = 0;
    /**
     * Now defining the currentSelectedMsgIndex,
     representing the current response index that the player is selecting.
     *  */ 
    currentSelectedMsgIndex = 0;
    dialogueHandler = null;
    
    constructor(options) {
        super(options);
        this.on("sealayk", () => {
            this.dialogueHandler.sealayk(this);
        })
        this.dialogueHandler = new AWTSMOOS.Dialogue(
            this, {
                approachShaym: "approach npc msg",
                npcMessageShaym: "msg npc",
                chossidMessageShaym: "msg chossid"
            }
        );
        
        if(options.dialogue) {
            this.dialogue = options.dialogue;
        }

        this.goofOptions = options.goof;

        if(options.state) {
            this.state = options.state
        }
        
        if (options.messageTree) {
            this.messageTree = options.messageTree;
        }

        this.on("nivraNeechnas", nivra => {
            this.dialogueHandler.nivraNeechnas(nivra);
        })
        this.on("nivraYotsee", nivra => {
            this.dialogueHandler.nivraYotsee(nivra);
            this.resetDialogueState();
        });
		
		this.on("change transformation", ({ position, rotation }) => {
            
		})

        // Additional properties can be set here
        this.on("started", async () => {
            await this.ayshPeula("check shlichus availablity");
        });

        this.on("check shlichus availablity", async () => {
            var d = this?.dialogue?.shlichuseem;
            if(!d) return false;
            var isAvailable = this.olam.ayshPeula("is shlichus available", d);
       
            if(isAvailable === false) {
                await this.ayshPeula("change icon style", {
                    selector: ".ikar",
                    properties: { style: { fill: "silver" } }
                })
                return;
            }

            await this.ayshPeula("change icon style", {
                selector: ".ikar",
                properties: { style: { fill: "orange" } }
            })
        })
    }

    resetDialogueState() {
        this.currentMessageIndex = 0;
        this.currentSelectedMsgIndex = 0;
        this.nivraTalkingTo = null;
        this._tempTree = null; // B"H: Clear temp tree on exit so new data can be loaded
        this.state = "idle";
    }

    handleDialogue() {
        var sh = this.dialogue.shlichuseem;
        var def = this.dialogue.default;
        
        this.messageTree = () => {
            if(!sh) return def;
            
            var startShlichusID = sh[0];
            if(!startShlichusID) return def;
            
            var shl = this.olam.ayshPeula("get next shlichus data", startShlichusID)
            if(!shl) return def;

            var d = shl.dialogue;
            if(!d) return def;

            if(!d.intro) return def;
            var mid = d.middle;
            if(!mid) return def;

            var fin = d.finished;
            if(!fin) return def;

            var sID = shl.id
            var activeShlichus = this.olam.ayshPeula("get active shlichus", sID);
            var isDone = this.olam.ayshPeula("is shlichus completed", sID)

            if(!activeShlichus) {
                if(!isDone) return d.intro;
                else return def;
            }

            if(activeShlichus.completed) {
                return fin;
            } else {
                return mid;
            }
        }
    }

    get currentMessage() {
        // B"H: Handles both array and single-object tree nodes if necessary, though usually array
        const tree = this.messageTree;
        if(Array.isArray(tree)) return tree[this.currentMessageIndex||0];
        return tree; 
    }

    selectResponse(responseIndex) {
        if(responseIndex !== undefined)
            this.currentSelectedMsgIndex = responseIndex;
        this.ayshPeula("selectedMessage", this.currentSelectedMsgIndex);
        return this.currentSelectedMsgIndex;
    }

    async toggleToOption(ind) {
        if(isNaN(ind) || ind < 0) return;

        var curM = this.currentMessage;
        if(!curM) return null;
        var resp = curM.responses;
        if(!resp) return null;

        if(this.currentSelectedMsgIndex != ind) {
            this.currentSelectedMsgIndex = ind;
            if(this.currentSelectedMsgIndex > resp.length - 1) {
                this.currentSelectedMsgIndex = resp.length - 1;
            }
            
            var selected = resp[this.currentSelectedMsgIndex];
            if(!selected) return null;
            
            return (this.selectResponse(this.currentSelectedMsgIndex));
        } else {
            await this.selectOption();
        }
    }

    toggleOption() {
        var curM = this.currentMessage;
        if(!curM) return null;
        var resp = curM.responses;
        if(!resp) return null;

        this.currentSelectedMsgIndex++;
        this.currentSelectedMsgIndex %= resp.length;
        
        var selected = resp[this.currentSelectedMsgIndex];
        if(!selected) return null;

        return (this.selectResponse(this.currentSelectedMsgIndex));
    }

    async selectOption() {
        await this.chooseResponse(this.currentSelectedMsgIndex);
    }

    // Navigate to a specific response based on player choice
    async changeResponseAndGoToIt({msgIndex=0, message, responses} = {}) {
        // B"H: CRITICAL FIX for Dynamic Trees
        // We utilize _tempTree to hold dynamic UI states (like shops) that are not saved to DB
        
        if (!this._tempTree) {
            const currentTree = typeof(this._messageTreeFunction) == "function" ? 
                this._messageTreeFunction(this) : this._messageTree;
            
            this._tempTree = JSON.parse(JSON.stringify(currentTree));
        }

        var msg = this._tempTree[msgIndex];
        
        if(msg) {
            try {
                msg.message = message;
                msg.responses = responses;
                this.currentSelectedMsgIndex = 0;
                this.currentMessageIndex = msgIndex;
                this.ayshPeula("chose");
                this.selectResponse();
            } catch(e) {
                console.log(e);
            }
        } else {
            console.log("Didn't do it")
        }
    }

    async chooseResponse(responseIndex) {
        var me = this;
        var chosenResponse = this.currentMessage.responses[responseIndex];
       
        if (!chosenResponse) return;
       
        // B"H: Store Logic
        if (chosenResponse.type === "store" || chosenResponse.action === "openStore") {
            if (me.olam && me.olam.player && me.olam.player.inventory) {
                const itemsToAdd = [
                    { id: 'brick_1x1x1', className: 'Brick', name: 'Bought Brick', quantity: 10 },
                    { id: 'wheat', className: 'Wheat', name: 'Fresh Wheat', quantity: 5 }
                ];
                
                itemsToAdd.forEach(item => me.olam.player.inventory.addItem(item, item.quantity));
                me.ayshPeula("close dialogue", "Thank you for your purchase! (Items added to inventory)");
            }
            this.state = "idle";
            return;
        }

        if (chosenResponse.nextMessageIndex !== undefined) {
            this.currentMessageIndex = chosenResponse.nextMessageIndex;
            this.currentSelectedMsgIndex = 0; 
        }
        
        if (chosenResponse.action && typeof chosenResponse.action === 'function') {
            var keepGoing = await chosenResponse.action(this, this.nivraTalkingTo);
            if(!keepGoing) {
                // Do not reset state here blindly, allow 'close dialogue' event to handle it
            }
        }

        if(chosenResponse.changeResponseAndGoToIt) {
            await this.changeResponseAndGoToIt(chosenResponse.changeResponseAndGoToIt);
        }

        if(chosenResponse.close) {
            var str = chosenResponse.close;
            if(typeof(str) == "string") {
                this.ayshPeula("close dialogue", str);
            }
            // B"H: Important cleanup for dynamic trees
            this._tempTree = null; 
            this.state = "idle";
        }

        if(chosenResponse.completeShlichus) {
            this.olam.ayshPeula("complete shlichus", chosenResponse.completeShlichus)
        }
        
        if(chosenResponse.remove) {
            me.olam.sealayk(me);
			me.olam.sealayk(me.av);
        }

        if(chosenResponse.acceptShlichus) {
            var id = chosenResponse.acceptShlichus;
            this.olam.ayshPeula("accept shlichus", id, me)
        }

        // Refresh UI if still talking
        if (this.state === "talking" && !chosenResponse.close) {
            this.currentSelectedMsgIndex = 0; 
            this.ayshPeula("chose");
            this.selectResponse();
        }
    }
	
	initializeEyelid(ref) { }

    async heescheel(olam) {
        await super.heescheel(olam);
        if(this.garments) {
	        var keys = Object.keys(this.garments);
	        keys.forEach(k => {
		        if(!this.garmentsDefault[k]) {
			        this.garments[k].visible = false;
		        }
	        })
        }
        return;
        if(!this.goofOptions) return;
        if(typeof(this.goofOptions) == "string" && this.goofOptions.startsWith("awtsmoos://")) {
            this.goofOptions = olam.getComponent(this.goofOptions)
        }
        if(this.goofOptions && typeof(this.goofOptions) == "object") {
            this.goofParts = this.goofOptions;
        }
    }
	
	async afterBriyah() {
		await super.afterBriyah(this)
	}

    async ready() {
        if(this.dialogue) {
            this.handleDialogue()  
        }
        if(this.goofParts) {
            this.goof = {}
            Object.keys(this.goofParts).forEach(q => {
                if(this.mesh)
                this.mesh.traverse(child => {
                    if(child.isMesh && child.name == q) {
                        this.goof[this.goofParts[q]] = child;
                    }
                })
            });
            delete this.goofOptions;
            delete this.goofParts;
        }
        await super.ready();
    }

    heesHawvoos(deltaTime) {
        super.heesHawvoos(deltaTime);
    }
}