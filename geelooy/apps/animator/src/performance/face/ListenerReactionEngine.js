// B"H
export class ListenerReactionEngine { static pose(speakerTalking=false,time=0){if(!speakerTalking)return null;const n=Math.sin(time*.002);return {emotion:n>.55?'curious':n<-.55?'thinking':'listening',gesture:n>.65?'soft_nod':'listen'};} }
