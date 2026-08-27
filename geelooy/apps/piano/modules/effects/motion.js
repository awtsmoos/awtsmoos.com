/* B"H
Motion routing lets one hidden breath move filter, FM, pitch, and width.
*/
export function createMotionState() { return { routes: [] }; }
export function addRoute(state, target, depth, rate) { state.routes.push({ target, depth, rate, phase: Math.random() * Math.PI * 2 }); }
export function value(route, t) { return Math.sin(t * route.rate + route.phase) * route.depth; }
