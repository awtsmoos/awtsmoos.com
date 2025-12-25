
/**
 * B"H
 * 
 * miscellanious event listeners
 * for many different things
 */

export default function() {
    this.on("stringify olam", () => {
        var stringed = this?.getCompiledNivrayimInfo();
        return stringed
    })

    this.on("activeObjectAction", a => {
        var chossid = this.nivrayim.find(q=>q.type=="chossid");
        if(chossid) {
            chossid?.ayshPeula("activeObjectAction", a)
        }
    })
    this.on("htmlPeula peula", ({peulaName, peulaVars}) => {
       
        
        try {
            this.ayshPeula(peulaName, peulaVars)
        } catch(e) {
            console.log("Issue",e)
        }
    });

    this.on("ui event", async (shaym, ob) => {
        return await this.ayshPeula("send ui event", shaym, ob)
    })

    this.on("htmlPeula", async ob => {
        if(!ob || typeof(ob) != "object") {
            return;
        }
    
        for(
            var k in ob
        ) {
            await this.ayshPeula("htmlPeula "+k,ob[k]);
        }
    });

    this.on("switch worlds", async(worldDayuh) => {
        var gameState = this.getGameState();
        this.ayshPeula("switchWorlds", {
            worldDayuh,
            gameState
        })
    });

    

    var lastAction;
    var lastTime = Date.now();
    this.on("increase loading percentage", async ({
        amount, action, info, subAction, reset, error
    }) => {
        if(!info) info = {};
        var {
            nivra
        } = info;
        
        // B"H: Logic to reset percentage if action changes OR if explicitly requested
        var shouldReset = reset || (lastAction != action);
        
        if (shouldReset) {
            lastTime = Date.now();
            // If explicit reset with amount (e.g. "jump to 50%"), use it. Otherwise reset to 0.
            this.currentLoadingPercentage = reset ? amount : 0;
        } else {
            this.currentLoadingPercentage += amount;
        }

        if(this.currentLoadingPercentage > 100) {
            this.currentLoadingPercentage = 100;
        }
        
        // B"H: IMPORTANT - Pass the 'error' object through to the next event
        this.ayshPeula("increased percentage", ({
            amount, action, subAction,
            total: this.currentLoadingPercentage,
            reset: shouldReset,
            error: error 
        }))
        
        lastAction = action;
    });
}
