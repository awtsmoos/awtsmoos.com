/**
 * B"H
 * 
 * events related to the main player -- chossid
 */

export default function() {

    this.on("ready from chossid", () => {
        setTimeout(() => {
            var c = this.nivrayim.find(w => w.isPlayer);
            if(!c) return;

            if(this.playerPosition) {
                try {
                    c.ayshPeula("change transformation", { position: this.playerPosition });
                } catch(e) {
                    console.error(e);
                }
            } else {
                console.warn("B\"H - ⚠️ [CHOSSID_REACTION]: No player position stored in the higher memory.");
            }
        }, 500);
    });

    this.on("save player position", () => {
        var c = this.nivrayim.find(w => w.isPlayer);
        if(!c) return // B"H: silent

        this.playerPosition = c.mesh.position.clone();
    });
}