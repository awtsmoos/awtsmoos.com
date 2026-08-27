

// B"H

export function createJawRig(){

    return{

        bone:"jaw",

        hinge:{
            pivot:[0,-0.05,0.18],
            axis:[1,0,0]
        },

        limits:{
            open:-0.6,
            close:0
        }

    }

}

