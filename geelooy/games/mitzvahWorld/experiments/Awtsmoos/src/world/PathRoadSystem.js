// B"H
import { houseAllAnchors } from './House3D.js';
import { createRoadGraph } from './road/RoadGraph.js';
import { planRoadRoutes } from './road/RoadRoutePlanner.js';
import { createRoadStrip } from './road/RoadStripGeometry.js';

/** Builds one connected road graph and one shared visual/collision strip. */
export function houseRoadSystem(assets, groundSampler) {
	const anchors = roadAnchors();
	const graph = createRoadGraph(anchors.houses);
	const routes = planRoadRoutes(graph);
	const strip = createRoadStrip(routes, groundSampler, assets.yellowBrickImage);
	const foldedSegments = routes.flatMap((route) => route.foldedSegments.map((index) => ({
		routeId: route.id,
		index
	})));
	const stats = {
		...graph.validation,
		...strip.stats,
		foldedSegments,
		maxTurnAngle: maximumTurnAngle(routes),
		connected: graph.validation.connected
	};
	strip.visual.userData = {
		AwtsmoosRoad: {
			...stats,
			textureLoaded: !!assets.yellowBrickImage,
			textureFallback: assets.yellowBrickImage?.dataset?.fallback === 'true'
		}
	};
	strip.collider.userData = { AwtsmoosRoadCollision: stats };
	return {
		anchors,
		graph,
		routes: routes.map((route) => route.id),
		visual: strip.visual,
		colliders: [strip.collider],
		stats
	};
}

export function roadAnchors() {
	const all = houseAllAnchors();
	return { houses: [all.main, ...all.district], plaza: { x: 31, z: -22 } };
}

export function roadNetworkDef({ texture, groundSampler, routes = [] }) {
	return createRoadStrip(routes, groundSampler, texture).visual;
}

function maximumTurnAngle(routes) {
	let maximum = 0;
	for (const route of routes) {
		for (let index = 1; index < route.points.length - 1; index += 1) {
			const previous = direction(route.points[index - 1], route.points[index]);
			const next = direction(route.points[index], route.points[index + 1]);
			const dot = Math.max(-1, Math.min(1, previous.x * next.x + previous.z * next.z));
			maximum = Math.max(maximum, Math.acos(dot));
		}
	}
	return maximum;
}

function direction(from, to) {
	const x = to.x - from.x;
	const z = to.z - from.z;
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}
