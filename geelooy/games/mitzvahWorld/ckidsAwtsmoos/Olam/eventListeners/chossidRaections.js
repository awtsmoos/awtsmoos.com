/**
 * B"H
 * 
 * events related to the main player -- chossid
 */

export default function() {

    this.on("ready from chossid", () => {
        setTimeout(() => {
          //  console.log("rain starting?")
            //this.ayshPeula("start rain cycle", 77)
         //   console.log("Started rain")
        }, 500)
        
    })

    this.on("reset player position", () => {
        var c = this.nivrayim.find(w => w.isPlayer);
        if(!c) return console.log("B\"H - ⚠️ [CHOSSID_REACTION]: couldn't find player vessel.");
        if(this.playerPosition) {
            console.log("B\"H - 📍 [CHOSSID_REACTION]: Resetting position to", this.playerPosition);
            try {
                c.ayshPeula("change transformation", { position: this.playerPosition });
            } catch(e) {
                console.error(e);
            }
        } else {
            console.warn("B\"H - ⚠️ [CHOSSID_REACTION]: No player position stored in the higher memory.");
        }
    });

    this.on("save player position", () => {
        var c = this.nivrayim.find(w => w.isPlayer);
        if(!c) return console.log("B\"H - ⚠️ [CHOSSID_REACTION]: No player found to save position.");
        this.playerPosition = c.mesh.position.clone();
    });
}