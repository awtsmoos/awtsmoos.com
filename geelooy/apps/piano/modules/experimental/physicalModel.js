/* B"H
Physical modeling sketches the invisible machine: hammer, tine, resonator, room.
*/
export function epModelParams(velocity=1) { return { tine: .7*velocity, hammer: .2+velocity*.3, pickup: .6, body: .35 }; }
