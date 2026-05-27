
/**
 * B"H
 * the initial "tzimtzum" setup method for Olam
 */
import defaultConfig from "../../defaultConfig.js";

export default class {
    async tzimtzum/*go, create world and load things*/
        ({
            systemInfo = {},
            userInfo = {}
        } = {}) {
            console.log("B\"H - Starting Tzimtzum Process...");
            var info = {
                ...systemInfo,
                ...userInfo
            };
            var {
                worldDayuhURL
            } = info;
            if(typeof(worldDayuhURL) == "string") {
                try {
                    var f = await import(worldDayuhURL);
                    if(f?.default) {
                        Object.assign(info, f.default);
                        Object.assign(userInfo, f.default);
                        console.log("B\"H - World Data Imported Successfully");
                    }
                } catch(e){
                    console.log("B\"H - Couldn't load dayuh: ",worldDayuhURL )
                }
            }
            
            // B"H: Merge Default Configuration
            if (defaultConfig) {
                if (defaultConfig.components) {
                    info.components = {
                        ...defaultConfig.components,
                        ...(info.components || {}) 
                    };
                }
            }

            console.log("B\"H - Info world consolidated");

            try {
                var on = info.on;
                if(typeof(on) == "object") {
                    Object.keys(on).forEach(q=> {
                        this.on(q, on[q]);
                    });
                }

                if(info.shaym) {
                    if(!this.shaym)
                        this.shaym = info.shaym;
                }

                await this.loadHebrewFonts();
                
                if(!info.nivrayim) {
                    info.nivrayim = {}
                }
                
                // Load components if any
                if (info.components) {
                    console.log("B\"H - Loading Components...");
                    await this.loadComponents(info.components);
                    console.log("B\"H - Components Loaded.");
                }

                if(info.vars) {
                    try {
                        this.vars = {...info.vars}
                    } catch(e) {}
                }
                if(info.assets) {
                    this.setAssets(info.assets);
                }

                if(info.modules) {
                    await this.getModules(info.modules)
                }
                if(info.set) {
                    try {
                        Object.assign(this, info.set);
                        if(this.userProgressManager) {
                            this.userProgressManager.load();
                        }
                    } catch(e){}
                }
                if(!this.resetY) {
                    this.resetY = -6;
                }
                if(info.html) {
                    console.log("B\"H - About to create HTML UI...");
                    var style = null
                        
                    if(!this.styled) { 
                        style = {
                            tag: "style",
                            innerHTML:/*css*/`
                                .ikarGameMenu {
                                    overflow: hidden;
                                    position: absolute;
                                    transform-origin:top left;
                                    bottom:0;
                                    right:0;
                                    top: 0;
                                    left: 0;
                                }

                                .gameUi > div {
                                    position:absolute;
                                }
                            `
                        };
                        this.styled = true;
                    }
                    

                    var par = {
                        shaym: `ikarGameMenu`,
                        parent: "main av",
                        children: [
                            info.html,
                            style
                        ],
                        className: `ikarGameMenu`
                    }
                    
                    var cr = await this.ayshPeula(
                        "htmlCreate",
                        par
                    );
                    
                    console.log("B\"H - HTML UI Created!");
                    
                    this.htmlUI = par;
                }

                /**
                 * Load the creations specified in the tzimtzum (start)
                 */
                var loaded;
                try {
                    console.log("B\"H - Starting loadNivrayim...");
                    
                    loaded = await this.loadNivrayim(info.nivrayim);
                    
                    console.log("B\"H - Finished loadNivrayim");
                } catch(e) {
                    console.error("B\"H - Problem loading nivrayim", e);
                    this.ayshPeula("error", {
                        code: "NO_LOAD_NIVRAYIM",
                        details: e,
                        message: "Couldn't load the Nivrayim"
                    })
                    return;
                }
                var st = info.gameState[this.shaym];
                if(st && st.shaym == this.shaym) {
                    console.log("B\"H - Setting Game State");
                    var set = this.setGameState(st);
                } else {
                    console.log("B\"H - Loading Level First Time");
                }
                this.ayshPeula("ready", this, loaded);
                this.ayshPeula("reset loading percentage");
                this.ayshPeula("setup map");
                
                console.log("B\"H - Officially Ready");
                
                // B"H: Trigger explicit ready signal to worker manager
                this.ayshPeula("ready to start game");
                
                this.baseInfo = userInfo;
                return loaded;
            } catch(e) {
                console.error("B\"H - Critical Issue in Tzimtzum:", e);
                this.ayshPeula("error", {
                    code: "ISSUE_IN_TZIMTZUM",
                    details: e,
                    message: "Some issue in the Tzimtzum not related to Nivrayim loading"
                })
            }
    }
}
