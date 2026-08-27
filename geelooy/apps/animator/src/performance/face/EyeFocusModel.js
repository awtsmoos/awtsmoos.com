// B"H
export class EyeFocusModel { static from({lookAt=null,emotion='calm',time=0}={}){const base=/amazed|surprised/.test(emotion)?1.18:/skeptical|thinking/.test(emotion)?.82:.96;return{open:base,pupilX:lookAt?0.12:Math.sin(time*.001)*.04,pupilY:Math.cos(time*.0009)*.025,blink:this.blink(time)};} static blink(t){const f=(t%4200);return f>80?0:1-f/80;} }
