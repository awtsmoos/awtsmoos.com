// B"H
export function createDynamicStoryWorld(){const events=[];return{record(event){events.push({...event,at:event.at??Date.now()});return events.at(-1)},threads(){return events.reduce((map,e)=>{const k=e.thread||e.kind||'world';(map[k]??=[]).push(e);return map},{})},nextHooks(){const kinds=new Set(events.map(e=>e.kind));return [kinds.has('helped-villager')?'gratitude-visit':null,kinds.has('storm')?'repair-mission':null,kinds.has('lost-animal')?'shepherd-search':null].filter(Boolean)},report(){return{events:events.slice(-12),hooks:this.nextHooks()}}}}
export default createDynamicStoryWorld;
