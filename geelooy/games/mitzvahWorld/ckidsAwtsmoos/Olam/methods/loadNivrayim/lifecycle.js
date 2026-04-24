
// B"H
export default {
    async runHeescheel(nivrayimMade) {
        console.log("B\"H - Initialization Phase (heescheel) starting for " + nivrayimMade.length + " entities.");
        for (var nivra of nivrayimMade) {
            if (nivra.heescheel && typeof(nivra.heescheel) === "function") {
                try {
                    console.log(`B"H - heescheel: ${nivra.name} (${nivra.type})`);
                    await nivra.heescheel(this, { nivrayimMade });
                } catch(e) {
                    console.error(`B"H - problem loading nivra ${nivra.name}`, e);
                }
                this.ayshPeula("increase loading percentage", {
                    amount:(100) / (nivrayimMade.length),
                    nivra,
                    action: "Setting up " + nivra.name,
                    info: { nivra }
                });
            }
        }
    },

    async runMadeAll(nivrayimMade) {
        console.log("B\"H - madeAll Phase");
        for (var nivra of nivrayimMade) {
            if (nivra.madeAll) {
                await nivra.madeAll(this);
            }
        }
    },

    async runReady(nivrayimMade) {
        console.log("B\"H - Ready Phase");
        for (var nivra of nivrayimMade) {
            if (nivra.ready) {
                await nivra.ready();
            }
        }
    },

    async runAfterBriyah(nivrayimMade) {
        console.log("B\"H - AfterBriyah Phase");
        for(var nivra of nivrayimMade) {
            if(nivra.afterBriyah) {
                await nivra.afterBriyah();
            }
        }
    }
};
