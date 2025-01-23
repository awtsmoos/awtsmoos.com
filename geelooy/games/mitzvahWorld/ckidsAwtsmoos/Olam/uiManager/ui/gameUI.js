/**
 * B"H
 * UI components that involve the in game experience
 */
import shlichusUI from "./shlichusUI.js";
import joystick  from "./joystick.js";
import instructions from "./instructions.js";
var ui = [
    instructions,
    {
        shaym: "menuTop",
        className:"menuTop",
        children: [
            {
                shaym: "menu button",
                className: "menuBtn",
                innerHTML: /*html*/`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M4 16H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 8H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 24H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <rect class="menuBtnRect" x="0" y="0" width="100%" height="100%" />
                </svg>
                `,
                ready(me,$) {
                    var rd = me.getElementsByClassName("btn")[0];
                    if(!rd) return;
                    rd.onclick = me.onclick;
                },
                onclick(e, $) {

                    
                    var m = $("menu")
                    
                    if(!m) return;
                    
                    m.classList.toggle("offscreen");
                    m.classList.toggle("onscreen");

                    var ins = $("instructions")
                    if(!ins) return;
                    
                }
            },
            {
                shaym:"title text holder",
                className: "titleTxt",
                children: [
                    {
                        tag:"span",
                        textContent: "Mitzvah",
                        className: "mtz"
                    },
                    {
                        tag: "span",
                        textContent: "World"
                    },
                    {
                        shaym: "Debug",
                        className: "hidden",
                        textContent:"Debugging"
                    }
                ]
            }
        ],
        style: {
            top: "0px"
        },
    },
    
    {
        shaym: "msg npc",
        style: {
            bottom: "20px",
            right: "15px"
        },
        awtsmoosClick: true,
        className: "dialogue npc",
    },

    {
        shaym: "msg chossid",
        style: {
            bottom: "20px",
            left: "15px"
        },
        awtsmoosClick: true,
        className: "dialogue chossid",
    },

    {
        shaym: "approach npc msg",
        className: "asApproachNpc hidden",
        
        awtsmoosOnChange: {
            textContent(e, me) {
                
                me.innerText = 
                "Press B to talk to "
                + e.data.textContent;

            }
        },
    },

    {
        shaym: "approach portal msg",
        className: "asApproachNpc hidden", 
        awtsmoosOnChange: {
            textContent(e, me) {
                
                me.innerText = 
                "Press B to travel to "
                + e.data.textContent;

            }
        },
    },
    {
        shaym: "Saving",
        className: "hidden menuItm",
        innerHTML: "Saving...",
        on: {
            awtsmoosHidden(e, $, ui) {
                console.log("Hidden!")
            },
            awtsmoosRevealed(e, $, ui) {
                console.log(`
                    B"H

                    Starting to save the world!
                `)
                var ikar = $("ikar");
                if(!ikar) {
                    alert("Something's wrong with menu")
                    console.log(e,ikar);
                    return;
                }
                ikar.dispatchEvent(
                    
                    new CustomEvent("olamPeula", {
                        detail: {
                            downloadWorld: true
                        }
                    })
                );
               /* */
            },
        }
    },
    {
        shaym: "action bar",
        className: "awtsmoosAction",
        awtsmoosClick: true,
        children: [
            {
                className: "minimize opened",
                onclick(e, $, ui, el) {
                    var slots = $("action bar")
                    if(!slots) return;
                    slots.classList.toggle("minimized");
                    el.classList.toggle("opened")
                    el.classList.toggle("closed")
                }
                
            },
            {
                className: "slots",
                shaym: "action slots"
            }
        ],
        on: {
            ready(e) {
                var {
                    el,
                    ui,
                    $f
                } = e.detail;
                var slotNumbers = 5;
                
                for(var i = 0; i < slotNumbers; i++) {
                    el.dispatch("addSlot", e.detail)
                }
            },
            addSlot(e) {
                var {
                    $f, ui, el

                } = e .detail;
                console.log(e)
                ui.$h({
                    parent: "action slots",
                    className: "actionSlot",
                    children: [
                        {
                            className: "innerSlot"
                        }
                    ]
                })
            }
        }
    },
    {
        shaym: "block selector menu",
        className: "blockSelected hidden",
        awtsmoosClick: true,
        children: ["Grab", "Rotate", "Scale"]
            .map(q=>({
                innerHTML: q,
                className: q,
                onclick: async(e) => {
                    ikar.dispatchEvent(
                    
                        new CustomEvent("olamPeula", {
                            detail: {
                                activeObjectAction: e.target.innerHTML
                            }
                        })
                    );
                }
            }))
    }
	

]
.concat(shlichusUI);

if(navigator.userAgent.includes("Mobile")) {
    ui = ui.concat(joystick);
    console.log("Doing mobile")
}

export default ui;