
/**
 * B"H
 * @module SwitchDestroyLogic
 * @description
 * When one world reaches its end, it returns to the void, making room for another.
 * "He builds worlds and destroys them."
 */
export default {
    /**
     * @async
     * @function destroyWorld
     * @description Shatters the current physical vessels to reset the stage.
     */
    async destroyWorld() {
        return new Promise((r,j) => {
            if(!this.socket) r(false);
            this.socket.onmessage = e => {
                var dst = e.data.destroyed;
                if(dst) {
                    delete this.socket;
                    r("Destroyed now creating new");
                }
            };
            this.socket.postMessage({
                destroyWorld: true
            });
            this.started = false;
        });
    },

    /**
     * @async
     * @function switchWorlds
     * @description Crosses the threshold between dimensions.
     */
    async switchWorlds({
        worldDayuh,
        gameState
    }) {
        if(gameState) {
            if(gameState.shaym) {
                this.gameState[
                    gameState.shaym
                ] = gameState;
            }
        }
        await this.destroyWorld();
        var ld = this.ui.getHtml("loading");
        if(ld) {
            this.ui.setHtml(ld, {
                className: "loading"
            });
        }
        console.log("this ui",this.ui);
        this.ui.htmlAction({
            shaym: "action loading",
            properties: {
                innerHTML: "Getting ready to start loading..."
            }
        });
        this.startWorld({worldDayuh});
    }
};
