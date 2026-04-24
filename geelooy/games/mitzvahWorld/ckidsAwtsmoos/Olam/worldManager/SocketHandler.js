
/**
 * B"H
 * @module SocketHandler
 * @description
 * Handling the whispering echoes from the Worker (Angel) back to the Main Thread.
 */
export default {
    /**
     * @function setOnmessage
     * @description Sets up the ears to listen to the worker's song.
     */
    setOnmessage() {
        try {
            if(this.socket) {
                this.socket.onmessage = e => {
                    if(e.data.switchWorlds) {
                        this.switchWorlds({
                            ...e.data.switchWorlds
                        });
                    }

                    if(e.data.loadedWorld) {
                        console.log("LOADED");
                        this.uiManager.makeGameMenu();
                    }
                };
                
                this.socket.onerror = this.onerror;
            } else {
                console.log("no socket!");
            }
        } catch(e) {
            alert(" Not able to set up world");
            console.log("Not set",e);
        }
    }
};
