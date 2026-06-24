// B"H
/** ForestSoundscape: birds wind leaves distant water; realism heard, not drawn. */
export class ForestSoundscape{
  constructor(){this.layers=new Map();}
  set(name,intensity=.5){this.layers.set(name,Math.max(0,Math.min(1,intensity)));return this.mix();}
  mix(){return[...this.layers.entries()].map(([name,intensity])=>({name,intensity}));}
  snapshot(){return{layers:this.mix(),cost:'audio-only near-zero render cost'};}
}
export default ForestSoundscape;
