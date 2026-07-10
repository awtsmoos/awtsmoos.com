// B"H
import { assertDoorAndHouseGeometry } from './DoorHouseAssertions.mjs';
import { createGeometryFixtures } from './GeometryFixtures.mjs';
import { assertStairAndRoadGeometry } from './StairRoadAssertions.mjs';

const fixtures = createGeometryFixtures();
const doorHouse = assertDoorAndHouseGeometry(fixtures);
const stairRoad = assertStairAndRoadGeometry(fixtures);

console.log(JSON.stringify({
	ok: true,
	houses: fixtures.specs.length,
	...doorHouse,
	...stairRoad
}, null, 2));
