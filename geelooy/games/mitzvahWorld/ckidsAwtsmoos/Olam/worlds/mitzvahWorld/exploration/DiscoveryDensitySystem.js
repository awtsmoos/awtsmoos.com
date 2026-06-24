// B"H
/** DiscoveryDensitySystem: every 2-4 minutes, the world reveals a new jewel. */
export class DiscoveryDensitySystem{
  constructor({minMs=120000,maxMs=240000}={}){this.minMs=minMs;this.maxMs=maxMs;this.last=0;this.next=minMs;}
  shouldReveal(now=Date.now()){return !this.last||now-this.last>=this.next;}
  reveal(candidates=[],now=Date.now()){if(!this.shouldReveal(now))return null;this.last=now;this.next=this.minMs+Math.floor(Math.random()*(this.maxMs-this.minMs));return candidates[0]||{type:'micro_discovery',text:'A remembered path bends toward a hidden kindness.'};}
}
export default DiscoveryDensitySystem;
