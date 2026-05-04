
// B"H
/**
 * @file Tooltips.js
 * @description
 * THE WHISPER OF THE VOID — Contextual hints for the soul.
 */
export const Tooltips = [
    { 
        shaym: "icon tooltip", 
        className: "awtsmoos-tooltip hidden"
    }, 
    {
        shaym: "block selector menu", 
        className: "blockSelected hidden", 
        awtsmoosClick: true,
        on: { 
            awtsmoosOptions(e) { 
                window?.socket?.postMessage?.({ 
                    uiEvented: { 
                        awtsmoosResponse: { 
                            array: Array.from(e.target.children).map(q => q.innerText) 
                        }, 
                        id: e.detail?._awtsmoosId 
                    } 
                }); 
            } 
        },
        children: ["Grab", "Delete"].map((q, i, a) => ({ 
            shaym: "menu item " + q, 
            innerHTML: q, 
            className: q, 
            on: { 
                awtsmoosHighlight(e) { 
                    var par = e.target.parentNode; 
                    Array.from(par.children).forEach(w => w.classList.remove("active")); 
                    e.target.classList.add("active"); 
                } 
            }, 
            onclick: async (e) => { 
                ikar.dispatchEvent(new CustomEvent("olamPeula", { 
                    detail: { activeObjectAction: e.target.innerHTML } 
                })); 
            } 
        }))
    }
];
