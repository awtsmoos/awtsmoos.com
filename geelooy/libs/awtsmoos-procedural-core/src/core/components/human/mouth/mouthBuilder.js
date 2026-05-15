
// B"H

import{buildTeeth}from"./teethBuilder.js";

export function buildMouth(){

    const teeth=buildTeeth();

    return{

        id:"mouth_root",

        children:[

            {
                id:"jaw",

                primitive:"pivot",

                parameters:{},

                children:[
                    teeth.children[1]
                ]
            },

            teeth.children[0]

        ]
    };
}
