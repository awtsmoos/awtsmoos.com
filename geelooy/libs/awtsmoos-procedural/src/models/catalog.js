// B"H
// Boruch Hashem
// Blessed is He
import { palaceMesh, studyHallMesh, towerMesh } from './architecture/civic.js';
import { shopMesh, townhouseMesh } from './architecture/residential.js';
import { compositeFlowerMesh, flowerSpikeMesh, irisClumpMesh, roseBushMesh } from './botany/flowers.js';
import { fernClumpMesh, grassClumpMesh, hostaClumpMesh, panicleShrubMesh } from './botany/foliage.js';
import {
	broadleafTreeMesh,
	cypressTreeMesh,
	floweringTreeMesh,
	oliveTreeMesh,
	pineTreeMesh,
	willowTreeMesh
} from './botany/trees.js';
import { hedgeMesh, monumentMesh, planterMesh, treeModelMesh } from './nature.js';
import { bollardMesh, benchMesh, fountainMesh, kioskMesh, streetLampMesh, streetSignModel } from './street.js';
import { busMesh, carMesh, marketCartMesh, taxiMesh, truckMesh, vanMesh } from './vehicles/road.js';

const FACTORIES = Object.freeze({
	townhouse: townhouseMesh,
	shop: shopMesh,
	tower: towerMesh,
	studyHall: studyHallMesh,
	palace: palaceMesh,
	car: carMesh,
	taxi: taxiMesh,
	van: vanMesh,
	bus: busMesh,
	truck: truckMesh,
	marketCart: marketCartMesh,
	bench: benchMesh,
	streetLamp: streetLampMesh,
	kiosk: kioskMesh,
	fountain: fountainMesh,
	streetSign: streetSignModel,
	bollard: bollardMesh,
	treeModel: treeModelMesh,
	planter: planterMesh,
	hedge: hedgeMesh,
	monument: monumentMesh,
	compositeFlower: compositeFlowerMesh,
	irisClump: irisClumpMesh,
	roseBush: roseBushMesh,
	flowerSpike: flowerSpikeMesh,
	panicleShrub: panicleShrubMesh,
	hostaClump: hostaClumpMesh,
	fernClump: fernClumpMesh,
	grassClump: grassClumpMesh,
	cypressTree: cypressTreeMesh,
	broadleafTree: broadleafTreeMesh,
	willowTree: willowTreeMesh,
	pineTree: pineTreeMesh,
	floweringTree: floweringTreeMesh,
	oliveTree: oliveTreeMesh
});

/**
 * The Awtsmoos gathers reusable procedural forms behind one deterministic catalog.
 * Unknown names retain the historical townhouse fallback for save compatibility.
 */
export function modelMesh(name, options = {}) {
	const factory = FACTORIES[name] || FACTORIES.townhouse;
	return factory({ ...options, seed: options.seed || `awtsmoos-${name}` });
}

export function modelNames() {
	return Object.keys(FACTORIES);
}

export function hasModel(name) {
	return Boolean(FACTORIES[name]);
}
