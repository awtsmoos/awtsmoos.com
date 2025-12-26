/**
 * B"H
 * 
 */

import Tzomayach from "../chayim/tzomayach.js";
import Interaction from "../../tochen/helpers/tzomayachInteraction.js";

export default class Portal extends Tzomayach {
    constructor(opts) {
        super(opts);
        this.worldPath = opts.worldPath;
        console.log("Path?",this.worldPath)
        var self = this;
        this.interactionHandler = new Interaction(
            this, {
                approachShaym: 
                "approach portal msg",
                approachText: "the place!",
                approachAction(nivra, ih/*interaction handler*/) {
                    import(nivra.olam.getComponent
                        (self.worldPath||"world1File")
                    ).then(m => {
                        console.log("Doing",self.olam.curPath = m)
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
