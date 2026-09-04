//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DemoDefinitions.js
 * @description Supplies five noun-neutral authored worlds that all travel through the
 * same universal definition, planning, constraint, compiler, cache, and provenance API.
 * The Awtsmoos renews stone, tree, mechanism, building, and river from one infinite source;
 * Awtsmoos.com lets their finite semantics differ without demanding a competing course.
 */

export const DEMO_DEFINITIONS = Object.freeze([
	Object.freeze({
		id:'stone-arch',title:'Jerusalem Stone Arch',kind:'architecture.arch',
		traits:['solid','walkable','loadBearing'],
		properties:{span:{value:5.4,unit:'m'},height:{value:4.1,unit:'m'},demoStyle:'arch'},
		materials:[{role:'stone',layers:[{material:'warm-limestone'},{material:'weathered-edge'}]}],
		constraints:[{id:'arch-clearance',type:'minClearance',value:2.4,unit:'m'}],
		compile:{channels:['visual','collision','metadata'],quality:'balanced',budget:{triangles:8000}}
	}),
	Object.freeze({
		id:'layered-building',title:'Layered Material Building',kind:'architecture.building',
		traits:['solid','walkable','habitable'],
		properties:{floors:7,width:{value:18,unit:'m'},demoStyle:'building'},
		materials:[{role:'facade',layers:[{material:'stone'},{material:'glass'},{material:'shade-screen'}]}],
		constraints:[{id:'building-clearance',type:'minClearance',value:2.8,unit:'m'}],
		compile:{channels:['visual','collision','navigation','metadata'],quality:'balanced',budget:{triangles:18000}}
	}),
	Object.freeze({
		id:'olive-tree',title:'Mature Olive Tree',kind:'nature.tree',
		traits:['living','branching','rooted'],
		properties:{age:{value:180,unit:'year'},canopy:{value:7.2,unit:'m'},demoStyle:'tree'},
		materials:[{role:'bark',layers:[{material:'olive-bark'}]},{role:'leaf',layers:[{material:'silver-green'}]}],
		constraints:[{id:'tree-region',type:'withinRegion',region:'grove-01'}],
		compile:{channels:['visual','collision','metadata'],quality:'balanced',budget:{triangles:12000}}
	}),
	Object.freeze({
		id:'mechanical-assembly',title:'Mechanical Assembly',kind:'mechanical.assembly',
		traits:['rigid','rotating','serviceable'],
		properties:{gearCount:5,shaftCount:2,demoStyle:'mechanical'},
		relationships:[{type:'drives',from:'input-shaft',to:'output-shaft'}],
		constraints:[{id:'gear-contact',type:'mustTouch',from:'drive-gear',to:'idler-gear'}],
		compile:{channels:['visual','collision','interaction','metadata'],quality:'balanced',budget:{triangles:10000}}
	}),
	Object.freeze({
		id:'river-terrain',title:'River Through Terrain',kind:'terrain.river',
		traits:['flowing','navigable','erosive'],
		properties:{length:{value:2.4,unit:'km'},width:{value:28,unit:'m'},demoStyle:'river'},
		materials:[{role:'water',layers:[{material:'river-water'}]},{role:'bank',layers:[{material:'alluvial-soil'}]}],
		constraints:[{id:'river-slope',type:'maxSlope',value:6,unit:'degree'}],
		compile:{channels:['visual','collision','navigation','metadata'],quality:'mobile',budget:{triangles:14000}}
	})
]);
