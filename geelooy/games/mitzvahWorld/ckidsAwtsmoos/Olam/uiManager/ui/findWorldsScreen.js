//B"H

export default {
    shaym: "find worlds",
    className: "findWorlds hidden menu",
    children: [
        {
          tag: "style",
            innerHTML: /*css*/`
                .findWorlds {
                    display: flex;
                    flex-direction: column;
                }

                .findWorlds input {
                    padding:15px;
                    margin:15px;
                }
            `
        },
        {
            tag: "button",
            textContent: "Back",
            onclick(e, $, ui) {
                var mm = $("main menu");
                if(!mm) {
                    alert("Can't go back!")
                    return;
                }
                mm.classList.remove("hidden");
                var cw = $("find worlds");
                cw.classList.add("hidden")
            }
        },
        {
            textContent: "Find worlds by Alias",
            className: "hdr1"
        },
        {
            children: [
                {
                  tag: "Input",
                    shaym: "aliasNameInput"
                },
                {
                    tag: "Button",
                    className: "mitzvahBtn",
                    textContent: "Search worlds of alias",
                    async onclick(e, $, ui) {
                        var name = $("aliasNameInput")
                        var out = $("output")
                      
                        
                        var ikar = $("ikar");
                        var mm = $("main menu");
                        
                        if(!ikar || !mm || !name || !out) {
                            alert("Can't do something, contact Coby")
                            return;
                        }
                        var alias = name?.value;
                        var worlds = await (await fetch(
                            `/api/social/aliases/${alias}/fileSystem/readFolder?${
                                new URLSearchParams({
                                    path: 
                                        `desktop.folder/game data.folder/worlds.folder`
                                })
                            }`
                        )).json();
                        if(Array.isArray(worlds)) {
                            var wl = worlds.map(w=> {
                                var dot = w.lastIndexOf(".")
                                if(dot < 0) return false;
                                var ext = w.substring(dot);
                                console.log(dot,ext)
                                if(ext != ".js") return false;
                                return w.substring(0, dot);
                            }).filter(Boolean);
                            if(!wl.length) {
                                out.innerHTML = "Nothing"
                            }
                            wl.forEach(w => {
                                var btn = document.createElement("button")
                                btn.innerHTML = w;
                                btn.classList.add("mitzvahBtn")
                                btn.onclick = async () => {
                                    var worldData = await (
                                        await fetch(
                                            `/api/social/aliases/awtsmoos/fileSystem/readFile?${
                                                new URLSearchParams({
                                                    path: `desktop.folder/game data.folder/worlds.folder/${
                                                        w
                                                    }.js`
                                                })   
                                            }`
                                        )
                                    ).text();
                             
                                    
                                    
                                    try {
                                        
                                         var bl =  URL.createObjectURL(
                                            new Blob([
                                                worldData
                                            ], {
                                                type: "application/javascript"
                                            })
                                        );
                                        ikar.dispatchEvent(
                                            new CustomEvent("start", {
                                                detail: {
                                                    worldDayuhURL: 
                                                    bl,
                                                    
                                                    gameUiHTML:
                                                    mm.gameUiHTML
                                                }
                                            })
                                        );
                                        var cw = $("find worlds");
                                        cw.classList.add("hidden")
            
                                        var ld = $("loading");
            
                                        mm.classList.add("hidden")
                                        mm.isGoing = false;
            
                                        if(!ld) return;
                                        ld.classList.remove("hidden");
                                    } catch(e) {
                                        alert("Couldn't load it")
                                        console.log(e);
                                    }
                                    
                                    console.log(worldData)
                                };
                                out.appendChild(btn)
                            })
                        } else {
                            out.innerHTML = "Nothing found"
                        }
                    }
                },
                {
                    shaym: "output"
                }
            ]
        }
        
    ]
}