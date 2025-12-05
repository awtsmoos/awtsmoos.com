/**
 * B"H
 * a class to help with dialogue
 */
import Interaction from "./tzomayachInteraction.js";
function processText(txt) {
    if(!txt) return "";
    return txt.split('\n').map(line => line.trimStart()).join('\n');
}

export default class Dialogue extends Interaction {
    
    constructor(me, opts = {}) {
        opts.approachAction = (nivra) => {
            var asset = this.me.asset;
            if(asset) {
                var cam = this.me.asset.cameras[0];
                if(cam) {
                    this.me.olam.activeCamera = cam;
                }
            }
            this.me.state = "talking";
            this.me.nivraTalkingTo = nivra;

            /**
             * Turn on dialogue
             */
            var curMsg = this.me.currentMessage;
            
            // --- Event: Update Message Text ---
            this.me.on("chose", () => {
                curMsg = this.me.currentMessage;
                if(!curMsg) return;
                
                this.me.olam.htmlAction(
                    this.opts.npcMessageShaym,
                    {
                        innerText: processText(curMsg.message || "...")
                    }
                );
            });

            // --- Event: Render Responses ---
            this.me.on("selectedMessage", async () => {
                if(this.me.state == "idle") return;
                
                var self = this;
                curMsg = this.me.currentMessage;
                
                if(curMsg && curMsg.responses) {
                    var ch = curMsg.responses.map((q,i)=>({
                        innerText: (i+1) + ". " + processText(q.text),
                        className: i == this.me.currentSelectedMsgIndex ? "selected" : "",
                        attributes: {
                            "data-index": i,
                            // B"H: Embed Entity ID to prevent cross-talk between NPCs
                            "data-entity-id": this.me.id 
                        },
                        onclick: function(e, $, ui) {
                            var target = e.target.closest("[data-index]");
                            if (!target) return;
                            
                            var ind = target.getAttribute("data-index");
                            var entId = target.getAttribute("data-entity-id");
                            
                            // B"H FIX: Dispatch event to 'ikar' (Main UI Root) wrapped in 'olamPeula'
                            // This ensures the UIManager's listener catches it and forwards it to the Worker.
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
                    
                    this.me.olam.htmlAction(
                        this.opts.chossidMessageShaym,
                        { children: ch }
                    );

                    // --- Listener for this specific interaction ---
                    var self = this;
                    async function toggle(data) {
                        // B"H: CRITICAL FILTER
                        // Only respond if this event is meant for ME
                        if (data.entityId !== self.me.id) return;

                        var idx = data.id;
                        await self.me.chooseResponse(idx);
                    }
                    
                    if(!self._toggleListener) {
                        self._toggleListener = async (...a) => await toggle(...a);
                        this.me.olam.on("htmlPeula toggleToOption", self._toggleListener);
                    }
                }
            });
            
            this.me.isShowing = true;
            this.me.olam.htmlAction({
                shaym: this.opts.npcMessageShaym,
                methods: { classList: { add: "active" } }
            });

            this.me.olam.htmlAction({
                shaym: this.opts.chossidMessageShaym,
                methods: { classList: { add: "active" } }
            });

            // Trigger Initial Render
            this.me.ayshPeula("chose");
            this.me.selectResponse();
            this.me.ayshPeula("selectedMessage");

            // --- Event: Close Dialogue ---
            this.me.on("close dialogue", (message) => {
                this.me.olam.activeCamera = null;
                
                this.me.isShowing = false;
                this.me.currentMessageIndex = 0;
                this.me.state = "idle";
                
                // Clean up listeners
                if(this._toggleListener) {
                    this.me.olam.remove("htmlPeula toggleToOption", this._toggleListener);
                    this._toggleListener = null;
                }
                
                this.me.clear("close dialogue");
                this.clearEvents();
                
                var msg = message || "bye bye!";
                var lng = msg.length * 62.5; // Reading time
                
                this.me.olam.htmlAction({
                    shaym: this.opts.npcMessageShaym,
                    properties: { innerHTML: msg }
                });

                this.me.olam.htmlAction({
                    shaym: this.opts.chossidMessageShaym,
                    methods: { classList: { remove: "active" } }
                });
                
                setTimeout(() => {
                    if(this.me.isShowing) return;
                    this.me.olam.htmlAction({
                        shaym: this.opts.npcMessageShaym,
                        methods: { classList: { remove: "active" } }
                    });
                }, lng);
            });
        }
        
        super(me, opts);
    }
   
    clearDialogueEvents() {
        if(this._toggleListener) {
            this.me.olam.remove("htmlPeula toggleToOption", this._toggleListener);
            this._toggleListener = null;
        }
        this.me.clear("chose");
        this.me.clear("selectedMessage");
    }
    
    clearEvents() {
        super.clearEvents();
        this.clearDialogueEvents();
    }

    nivraNeechnas(nivra) {
        super.nivraNeechnas(nivra, this.me);

        if(nivra.type != "chossid") return;

        this.me.on("initial approach", () => {
            this.me.on("was moved away from", () => {
                this.me.currentMessageIndex = 0;
            });
        });
    }
}