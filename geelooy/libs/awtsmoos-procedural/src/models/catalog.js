// B"H
import { palaceMesh, studyHallMesh, towerMesh } from './architecture/civic.js';
import { shopMesh, townhouseMesh } from './architecture/residential.js';
import { hedgeMesh, monumentMesh, planterMesh, treeModelMesh } from './nature.js';
import { bollardMesh, benchMesh, fountainMesh, kioskMesh, streetLampMesh, streetSignModel } from './street.js';
import { busMesh, carMesh, marketCartMesh, taxiMesh, truckMesh, vanMesh } from './vehicles/road.js';

const FACTORIES = {
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
	monument: monumentMesh
};

/** Public reusable model catalog for all Awtsmoos games. */
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
