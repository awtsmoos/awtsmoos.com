// B"H
export const HEALTHY_LUNCH_BEATS = [
  { start: 0, end: 1600, cameraId: 'hl_establish', speaker: 'guide', listener: 'kid', text: 'Welcome to the healthy lunch challenge.', emotion: 'warm', gesture: 'explain' },
  { start: 1700, end: 3200, cameraId: 'hl_table', speaker: 'kid', listener: 'guide', text: 'The food is moving like a cartoon!', emotion: 'surprised', gesture: 'react_surprise' },
  { start: 3300, end: 4700, cameraId: 'hl_food_insert', speaker: 'guide', listener: 'kid', text: 'Apple hops onto the plate first.', prop: { id: 'apple', type: 'apple', action: 'hop', from: { x: -62, y: 103 }, to: { x: -38, y: 100 }, height: 12, size: 14 } },
  { start: 4800, end: 6200, cameraId: 'hl_food_insert', speaker: 'kid', listener: 'guide', text: 'Carrot rolls in with a crunchy spin.', prop: { id: 'carrot', type: 'carrot', action: 'roll', from: { x: 42, y: 105 }, to: { x: 6, y: 104 }, height: 4, size: 17 } },
  { start: 6300, end: 7900, cameraId: 'hl_kid', speaker: 'guide', listener: 'kid', text: 'Now take a bite and let the scene react.', foodAction: { verb: 'bite', actor: 'kid', food: 'apple', at: { x: -40, y: 100 } } },
  { start: 8000, end: 12000, cameraId: 'hl_celebrate', speaker: 'kid', listener: 'guide', text: 'Healthy food can be fun, alive, and beautiful!', emotion: 'happy', gesture: 'celebrate' }
];
