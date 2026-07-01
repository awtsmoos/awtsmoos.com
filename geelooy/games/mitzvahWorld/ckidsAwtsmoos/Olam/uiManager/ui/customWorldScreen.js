// B"H
function awtsmoosNotice(message) {
  const text = String(message ?? "");
  console.warn('B"H | NOTICE_NO_BLOCKING_DIALOG', text);
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ ||= [];
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.push({ at: Date.now(), text, source: import.meta?.url || "unknown" });
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ = globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.slice(-80);
}
/**
 * B"H
 */

export default {
    shaym: "custom world",
    className: "customWorldScreen hidden",
    children: [
        {
            tag: "style",
            innerHTML:/*css*/`
.customWorldScreen {
    text-align: center;
    padding: 50px;
    border: 5px solid #ffcc00;
    border-radius: 15px;
    background: linear-gradient(135deg, #ff007f, #00ff7f);
    box-shadow: 0 0 20px rgba(255, 0, 127, 0.5), 0 0 30px rgba(0, 255, 127, 0.5);
    transition: transform 0.3s ease;
}


.customWorldScreen button {
    background-color: #ffcc00;
    color: #1c1c1c;
    border: none;
    padding: 15px 30px;
    font-size: 20px;
    cursor: pointer;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(255, 204, 0, 0.5);
    transition: all 0.3s ease;
    margin: 10px;
}

.customWorldScreen button:hover {
    background-color: #ffd700;
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(255, 204, 0, 0.7);
}

.customWorldScreen .hdr1 {
    font-size: 32px;
    margin: 20px 0;
    text-shadow: 2px 2px 5px rgba(255, 0, 127, 0.5);
}

.customWorldScreen a {
    color: #00ff7f;
    font-size: 18px;
    text-decoration: none;
    transition: color 0.3s ease;
    display: inline-block;
    margin: 10px 0;
}

.customWorldScreen a:hover {
    color: #ff007f;
    text-shadow: 1px 1px 3px rgba(255, 0, 127, 0.5);
}
            `
        },
        {
            tag: "button",
            textContent: "Back",
            onclick(e, $, ui) {
                var mm = $("main menu");
                if(!mm) {
                    awtsmoosNotice("Can't go back!")
                    return;
                }
                mm.classList.remove("hidden");
                var cw = $("custom world");
                cw.classList.add("hidden")
            }
        },
        {
            textContent: "Load a custom world",
            className: "hdr1"
        },
        {
            textContent:"Example world code, you can download it and modify it",
            tag:"a",
            target:"blank",
            href:"https://github.com/ymerkos/awtsfaria/blob/main/geelooy/games/mitzvahWorld/tochen/worlds/2.js"
        },
        {
            tag:"br"
        },
        {
            textContent: "Documentation",
            target:"blank",
            href:"./documentation",
            tag: "a"
        },
        {
            tag:"br"
        },
        {
            tag: "Button",
            textContent: "Click to import world file (.js module)",
            onclick(e, $, ui) {
                var ikar = $("ikar");
                var mm = $("main menu");
                
                if(!ikar || !mm) {
                    awtsmoosNotice("Can't do something, contact Coby")
                    return;
                }
                var inp = ui.html({
                    tag: "input",
                    type: "file",
                    className:"hidden",
                    async onchange(e) {
                        if(!e.target.files[0]) {
                            awtsmoosNotice("No file selected!")
                            return;
                        }
                        var lvl = await new Promise(async (r,j) => {
                            var req = await fetch(URL.createObjectURL(
                                e.target.files[0])
                            );
                            var txt = await req.text();
                            r(txt);
                        });
                        var bl =  URL.createObjectURL(
                            new Blob([
                                lvl
                            ], {
                                type: "application/javascript"
                            })
                        );
                 
                        
                        
                        try {
                            ikar.dispatchEvent(
                                new CustomEvent("start", {
                                    detail: {
                                        worldDayuhURL: 
                                        bl,
                                        /*dayuhOfOlam
                                            .default,*/
                                        gameUiHTML:
                                        mm.gameUiHTML
                                    }
                                })
                            );
                            var cw = $("custom world");
                            cw.classList.add("hidden")

                            var ld = $("loading");

                            mm.classList.add("hidden")
                            mm.isGoing = false;

                            if(!ld) return;
                            ld.classList.remove("hidden");
                        } catch(e) {
                            awtsmoosNotice("Couldn't load it")
                            // B"H: silent

                        }
                        

                       
                        
                        
                    }
                });
                inp.click();
            }
        }
    ]
};