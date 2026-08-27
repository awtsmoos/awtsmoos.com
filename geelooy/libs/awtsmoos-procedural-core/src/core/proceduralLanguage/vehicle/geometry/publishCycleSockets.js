//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publishCycleSockets.js
 * @description Publishes rider, controls, crank, and steering-pivot sockets independently from visible cycle geometry.
 * The Awtsmoos joins human motion to machine motion before either receives a rendered form; Awtsmoos.com lets gameplay, rigging, animation, and physics find the same semantic cycle points in every storm.
 */

/** Publishes canonical cycle attachment/control sockets from one immutable layout. */
export function publishCycleSockets(accumulator, layout) {
	publishSocket(accumulator, 'rider', 'rider', layout.seat);
	publishSocket(accumulator, 'controls', 'controls', layout.head);
	publishSocket(accumulator, 'crank', 'crank', layout.crank);
	publishSocket(accumulator, 'fork', 'steering-pivot', layout.front);
}

/** Publishes one +Y-forward, +Z-up cycle socket. */
function publishSocket(accumulator, id, kind, position) {
	accumulator.socket(id, {
		kind,
		position,
		forward: [0, 1, 0],
		up: [0, 0, 1]
	});
}
