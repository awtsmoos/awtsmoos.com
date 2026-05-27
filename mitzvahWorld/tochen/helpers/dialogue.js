

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
            // We use setTimeout 0 to ensure the worker processes the HTML creation if it hasn't happened yet
            setTimeout(() => {
                this.me.olam.htmlAction({
                    shaym: this.opts.npcMessageShaym,
                    methods: { classList: { add: "active", remove: "hidden" } },
                    properties: { style: { display: 'flex', opacity: '1', visibility: 'visible' } } // B"H: Force visibility styles
                });

                this.me.olam.htmlAction({
                    shaym: this.opts.chossidMessageShaym,
                    methods: { classList: { add: "active", remove: "hidden" } },
                    properties: { style: { display: 'flex', opacity: '1', visibility: 'visible' } }
                });
            }, 0);

            // --- Trigger Initial Render ---
            // We fire these immediately. The listeners are attached below.
            this.me.ayshPeula("chose");
            this.me.selectResponse();
            this.me.ayshPeula("selectedMessage");
        };

        // --- Event: Update Message Text ---
        this.me.on("chose", () => {
            var curMsg = this.me.currentMessage;
            if(!curMsg) {
                // Console warn removed to reduce noise
                return;
            }
            
            // B"H: Ensure we aren't showing "..." if real content exists
            var txt = processText(curMsg.message || "...");
            
            if(this.me.olam)
                this.me.olam.htmlAction(
                    this.opts.npcMessageShaym,
                    {
                        innerText: txt
                    }
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
                        // B"H: Embed Entity ID to prevent cross-talk between NPCs
                        "data-entity-id": this.me.id 
                    },
                    onclick: function(e, $, ui) {
                        e.stopPropagation(); // B"H: Prevent click from propagating to world
                        var target = e.target.closest("[data-index]");
                        if (!target) return;
                        
                        var ind = target.getAttribute("data-index");
                        var entId = target.getAttribute("data-entity-id");
                        
                        // B"H FIX: Dispatch event to 'ikar' (Main UI Root) wrapped in 'olamPeula'
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

        // --- Listener for Toggle/Selection ---
        var self = this;
        this._toggleListener = async function(data) {
            // B"H FIX: Use loose equality (!=) because attributes are strings but internal IDs might be numbers
            if (data.entityId != self.me.id) return;
            var idx = data.id;
            await self.me.chooseResponse(idx);
        };
        
        // B"H FIX: Only attach global listener if Olam exists (prevents inventory hydration crash)
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
            var lng = Math.max(1000, msg.length * 62.5); // Minimum 1 second display
            
            this.me.olam.htmlAction({
                shaym: this.opts.npcMessageShaym,
                properties: { innerHTML: msg }
            });

            // Immediately hide response box
            this.me.olam.htmlAction({
                shaym: this.opts.chossidMessageShaym,
                methods: { classList: { remove: "active", add: "hidden" } }
            });
            
            setTimeout(() => {
                // Only hide if we haven't started talking again in the meantime
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
        // Only clear temporary state handlers
       // super.clearEvents();
    }

    nivraNeechnas(nivra) {
        super.nivraNeechnas(nivra);

        if(nivra.type != "chossid") return;

        // B"H: Ensure we reset the conversation pointer when the player leaves
        this.me.on("was moved away from", () => {
            this.me.currentMessageIndex = 0;
            this.me.currentSelectedMsgIndex = 0;
            // Force close event just in case
            this.me.ayshPeula("close dialogue");
        });
    }
}
