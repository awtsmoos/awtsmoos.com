

// B"H

export class BlinkController{

    constructor(upperLid,lowerLid){

        this.upper=upperLid
        this.lower=lowerLid

        this.timer=0

        this.interval=3+Math.random()*2

    }

    update(dt){

        this.timer+=dt

        if(this.timer>this.interval){

            this.timer=0

            this.interval=3+Math.random()*3

            this.blink()

        }

    }

    blink(){

        const closeUpper=0.3
        const closeLower=-0.3

        this.upper.animateRotation([closeUpper,0,0],0.08)
        this.lower.animateRotation([closeLower,0,0],0.08)

        setTimeout(()=>{

            this.upper.animateRotation([-0.75,0,0],0.12)
            this.lower.animateRotation([0.75,0,0],0.12)

        },80)

    }

}

