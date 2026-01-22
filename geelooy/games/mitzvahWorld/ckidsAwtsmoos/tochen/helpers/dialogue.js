// B"H
/**
 * a class to help with dialogue
 */
import Interaction from "./tzomayachInteraction.js";

function processText(txt) {
    if(!txt) return "";
    return txt.split('\n').map(line => line.trimStart()).join('\n');
}

export default class Dialogue extends Interaction {
    
    constructor(me, opts = {}) {
        // B"H: Ensure opts has the correct selectors
        opts.npcMessageShaym = opts.npcMessageShaym || "msg npc";
        opts.chossidMessageShaym = opts.chossidMessageShaym || "msg chossid";

        super(me, opts);

        // B"H: Define the approach action explicitly in constructor to bind scope correctly
        this.opts.approachAction = (nivra) => {
            if (!this.me.olam) return; // Safety check

            var asset = this.me.asset;
            if(asset && asset.cameras && asset.cameras[0]) {
                this.me.olam.activeCamera = asset.cameras[0];
            }
            
            this.me.state = "talking";
            this.me.nivraTalkingTo = nivra;

            // B"H: Set isShowing immediately so subsequent logic knows we are active
            this.me.isShowing = true;

            // --- Force UI Active ---
            setTimeout(() => {
                this.me.olam.htmlAction({
                    shaym: this.opts.npcMessageShaym,
                    methods: { classList: { add: "active", remove: "hidden" } },
                    properties: { style: { display: 'flex', opacity: '1', visibility: 'visible' } } 
                });

                this.me.olam.htmlAction({
                    shaym: this.opts.chossidMessageShaym,
                    methods: { classList: { add: "active", remove: "hidden" } },
                    properties: { style: { display: 'flex', opacity: '1', visibility: 'visible' } }
                });
            }, 0);

            // --- Trigger Initial Render ---
            this.me.ayshPeula("chose");
            this.me.selectResponse();
            this.me.ayshPeula("selectedMessage");
        };

        // --- Event: Update Message Text ---
        this.me.on("chose", () => {
            var curMsg = this.me.currentMessage;
            if(!curMsg) return;
            
            var txt = processText(curMsg.message || "...");
            
            if(this.me.olam)
                this.me.olam.htmlAction(
                    this.opts.npcMessageShaym,
                    { innerText: txt }
                );
        });

        // --- Event: Render Responses ---
        this.me.on("selectedMessage", async () => {
            if(this.me.state == "idle") return;
            
            var curMsg = this.me.currentMessage;
            
            if(curMsg && curMsg.responses) {
                var ch = curMsg.responses.map((q,i)=>({
                    innerText: (i+1) + ". " + processText(q.text),
                    className: i == this.me.currentSelectedMsgIndex ? "selected" : "",
                    attributes: {
                        "data-index": i,
                        "data-entity-id": this.me.id 
                    },
                    onclick: function(e, $, ui) {
                        e.stopPropagation();
                        var target = e.target.closest("[data-index]");
                        if (!target) return;
                        
                        var ind = target.getAttribute("data-index");
                        var entId = target.getAttribute("data-entity-id");
                        
                        var ikar = $("ikar");
                        if(ikar) {
                            ikar.dispatchEvent(new CustomEvent("olamPeula", {
                                detail: {
                                    htmlPeula: {
                                        toggleToOption: {
                                            id: ind,
                                            entityId: entId
                                        }
                                    }
                                }
                            }));
                        }
                    },
                    awtsmoosClick: true
                }));
                
                if(this.me.olam)
                    this.me.olam.htmlAction(
                        this.opts.chossidMessageShaym,
                        { children: ch }
                    );
            }
        });

        var self = this;
        this._toggleListener = async function(data) {
            if (data.entityId != self.me.id) return;
            var idx = data.id;
            await self.me.chooseResponse(idx);
        };
        
        if (this.me.olam) {
            this.me.olam.on("htmlPeula toggleToOption", this._toggleListener);
        }

        // --- Event: Close Dialogue ---
        this.me.on("close dialogue", (message) => {
            if(!this.me.olam) return;

            this.me.olam.activeCamera = null;
            
            this.me.isShowing = false;
            this.me.currentMessageIndex = 0;
            this.me.state = "idle";
            
            var msg = message || "bye bye!";
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
    
    nivraNeechnas(nivra) {
        super.nivraNeechnas(nivra);
        if(nivra.type != "chossid") return;

        this.me.on("was moved away from", () => {
            this.me.currentMessageIndex = 0;
            this.me.currentSelectedMsgIndex = 0;
            this.me.ayshPeula("close dialogue");
        });
    }
}
