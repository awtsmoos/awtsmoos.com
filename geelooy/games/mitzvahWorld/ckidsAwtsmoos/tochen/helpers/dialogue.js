
/**
 * B"H
 * @module Dialogue
 * @description
 * 
 * Chapter 42: The Sefirah of Da'as (Knowledge)
 * "Death and life are in the power of the tongue." (Mishlei 18:21)
 * 
 * This grand class manages the conversation between souls. When the Chossid encounters
 * a Medabeir (speaker), this interface awakens. It reads the 'MessageTree' data structure, 
 * pushing pure HTML/CSS representations of thought into the physical world. It ensures that 
 * when the soul turns away (Yotsee), the conversation seamlessly dissolves back into the ether.
 */
import Interaction from "./tzomayachInteraction.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function processText(txt) {
    if(!txt) return "";
    return txt.split('\n').map(line => line.trimStart()).join('\n');
}

export default class Dialogue extends Interaction {
    
    constructor(me, opts = {}) {
        opts.npcMessageShaym = opts.npcMessageShaym || "msg npc";
        opts.chossidMessageShaym = opts.chossidMessageShaym || "msg chossid";

        super(me, opts);

        // B"H: The Initial Approach - Activating the channels of speech
        this.opts.approachAction = (nivra) => {
            if (!this.me.olam) return;

            var asset = this.me.asset;
            if(asset && asset.cameras && asset.cameras[0]) {
                this.me.olam.activeCamera = asset.cameras[0];
            }
            
            this.me.state = "talking";
            this.me.nivraTalkingTo = nivra;
            this.me.isShowing = true;

            // B"H: Pushing HTML commands into the global Olam UI orchestrator
            setTimeout(() => {
                this.me.olam.htmlAction({
                    shaym: this.opts.npcMessageShaym,
                    methods: { classList: { add: "active", remove: "hidden" } },
                    properties: { style: { display: 'flex', opacity: '1', visibility: 'visible', pointerEvents: 'auto', flexWrap: 'wrap', maxWidth: '80%' } } 
                });

                this.me.olam.htmlAction({
                    shaym: this.opts.chossidMessageShaym,
                    methods: { classList: { add: "active", remove: "hidden" } },
                    properties: { style: { display: 'flex', opacity: '1', visibility: 'visible', pointerEvents: 'auto', flexWrap: 'wrap', maxWidth: '80%' } }
                });
            }, 0);

            this.me.ayshPeula("chose");
            this.me.ayshPeula("selectedMessage");
        };

        // B"H: Render the speech of the NPC with a soulful typewriter effect
        this.me.on("chose", () => {
            var curMsg = this.me.currentMessage;
            if(!curMsg) return;
            
            var txt = processText(curMsg.message || "...");
            
            if(this.me.olam) {
                // B"H: silent

                
                // Reset the vessel first
                this.me.olam.htmlAction(this.opts.npcMessageShaym, { innerText: "" });
                
                // Manifest the letters one by one
                let current = "";
                let i = 0;
                const speed = 25; // ms per character
                
                const type = () => {
                    if (i < txt.length) {
                        current += txt[i];
                        this.me.olam.htmlAction(this.opts.npcMessageShaym, { innerText: current });
                        i++;
                        setTimeout(type, speed);
                    }
                };
                type();
            }
        });

        // B"H: Render the choices for the Player
        this.me.on("selectedMessage", async () => {
            if(this.me.state == "idle") return;
            
            var curMsg = this.me.currentMessage;
            
            if(curMsg && curMsg.responses) {
                var ch = curMsg.responses.map((q,i)=>({
                    innerText: (i+1) + ". " + processText(q.text),
                    className: i == this.me.currentSelectedMsgIndex ? "selected" : "",
                    attributes: { "data-index": i, "data-entity-id": this.me.id, "onclick": `
                        event.stopPropagation();
                        var target = event.target.closest('[data-index]');
                        if (!target) return;
                        
                        var ind = target.getAttribute('data-index');
                        var entId = target.getAttribute('data-entity-id');
                        
                        var ikar = document.getElementById('ikar');
                        if(ikar) {
                            ikar.dispatchEvent(new CustomEvent('olamPeula', {
                                detail: {
                                    htmlPeula: { toggleToOption: { id: ind, entityId: entId } }
                                }
                            }));
                        }
                    `},
                    awtsmoosClick: true
                }));
                
                if(this.me.olam)
                    this.me.olam.htmlAction(
                        this.opts.chossidMessageShaym,
                        { children: ch }
                    );
            }
        });

        // B"H: Receiving the choice from the Web Worker UI bridge
        var self = this;
        this._toggleListener = async function(data) {
            if (data.entityId != self.me.id) return;
            var idx = data.id;
            // B"H: silent

            await self.me.chooseResponse(idx);
        };
        
        if (this.me.olam) {
            this.me.olam.on("htmlPeula toggleToOption", this._toggleListener);
        }

        // B"H: The End of the Interaction. Silence the connection.
        this.me.on("close dialogue", (message) => {
            if(!this.me.olam) return;

            // B"H: silent

            this.me.olam.activeCamera = null;
            this.me.isShowing = false;
            this.me.currentMessageIndex = 0;
            this.me.state = "idle";
            
            var msg = message || "Shalom uvracha!";
            var lng = Math.max(1000, msg.length * 62.5); 
            
            this.me.olam.htmlAction({
                shaym: this.opts.npcMessageShaym,
                properties: { innerHTML: msg }
            });

            this.me.olam.htmlAction({
                shaym: this.opts.chossidMessageShaym,
                methods: { classList: { remove: "active", add: "hidden" } }
            });
            
            setTimeout(() => {
                if(this.me.isShowing) return;
                this.me.olam.htmlAction({
                    shaym: this.opts.npcMessageShaym,
                    methods: { classList: { remove: "active", add: "hidden" } }
                });
            }, lng);
        });
    }
   
    clearDialogueEvents() {
        if(this._toggleListener && this.me.olam) {
            this.me.olam.remove("htmlPeula toggleToOption", this._toggleListener);
            this._toggleListener = null;
        }
    }
    
    clearEvents() {
    }

    nivraNeechnas(nivra) {
        super.nivraNeechnas(nivra);

        if(nivra.type != "chossid") return;

        this.me.on("was moved away from", () => {
            // B"H: silent

            this.me.currentMessageIndex = 0;
            this.me.currentSelectedMsgIndex = 0;
            this.me.ayshPeula("close dialogue");
        });
    }
}
