/**
 * B"H
 * "Mitzvah Btn",
 * meaning fancy looking 
 * extruded button template
 */

import btnBubble from "./btnBubble.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default (opts={})=>{
    var ob = {
        ...(
            opts
        ),
        tag: "button",
        className: opts.className||""+
        " mitzvahBtn",
            style:{},
        children: [
            {
                className: "mitzvahBtnTxt",
                textContent: opts.text,
                
            },
            {
                className:"svgHolder",
                innerHTML:/*html*/`
                    ${btnBubble}
                `
            }
        ],
    };
    var c=opts.color;
    if(c) {
        ob.style.background=c
    }
    return ob
}   
