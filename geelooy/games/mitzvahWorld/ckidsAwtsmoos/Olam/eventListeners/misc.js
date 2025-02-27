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
        amount, action, info, subAction
    }) => {
        if(!info) info = {};
        var {
            nivra
        } = info;
        var reset = false;
        if(lastAction != action) {
            lastTime = Date.now();
            this.currentLoadingPercentage = 0;
            //this.ayshPeula("reset loading percentage")
            reset = true;
        }
        this.currentLoadingPercentage += amount;
        

        if(this.currentLoadingPercentage > 100) {
            this.currentLoadingPercentage = 100;
        }
        else {
            /*this.ayshPeula(
                "finished loading", ({
                    amount,  action,
                    total: this.currentLoadingPercentage 
                })
            )*/
        }
        this.ayshPeula("increased percentage", ({
            amount, action, subAction,
            total: this.currentLoadingPercentage,
            reset
        }))
        
        lastAction = action;
        
    });
}