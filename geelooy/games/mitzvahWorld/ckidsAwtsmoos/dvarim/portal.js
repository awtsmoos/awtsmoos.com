/**
 * B"H
 * 
 */


import * as AWTSMOOS from "../awtsmoosCkidsGames.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class Portal extends AWTSMOOS.Tzomayach {
    constructor(opts) {
        super(opts);
        this.worldPath = opts.worldPath;
        // B"H: silent

        var self = this;
        this.interactionHandler = new AWTSMOOS.Interaction(
            this, {
                approachShaym: 
                "approach portal msg",
                approachText: "the place!",
                approachAction(nivra, ih/*interaction handler*/) {
                    import(nivra.olam.getComponent
                        (self.worldPath||"world1File")
                    ).then(m => {
                        // B"H: silent

                        nivra.olam.ayshPeula(
                            "switch worlds",
                            m.default
                        )
                    })
                    self.ayshPeula(
                        "close dialogue", "Ok cool story!!"
                    );
                }

            }
        );

        this.on("nivraNeechnas", nivra => {
            
            this.interactionHandler.nivraNeechnas(nivra);
        });

        this.on("nivraYotsee", nivra => {
            this.interactionHandler.nivraYotsee(nivra);

        });
    }
}