// B"H
const EVENTS=["lost-sheep","merchant-caravan","village-repair","orchard-harvest","missing-sefer","wandering-traveler","injured-animal"];
export function nearbyWorldEvents({seed=1,count=3}={}){return Array.from({length:count},(_,i)=>({id:`${EVENTS[(seed+i)%EVENTS.length]}-${seed}-${i}`,kind:EVENTS[(seed+i)%EVENTS.length],activeNearPlayer:true,frameCost:"event-driven"}))}
export default nearbyWorldEvents;
