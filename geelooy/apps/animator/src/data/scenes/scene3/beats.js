// B"H

export const SCENE3_BEATS = [
  { start: 0, end: 1800, cameraId: 's3_master', speaker: 'guide', listener: 'builder', text: 'Scene three starts grounded. Feet stay on the park floor.', emotion: 'focused', gesture: 'explain', mode: 'subtitle' },
  { start: 1900, end: 3600, cameraId: 's3_two_left', speaker: 'builder', listener: 'guide', text: 'No more floating in the air. The camera is calm and readable.', emotion: 'happy', gesture: 'open_hand', mode: 'subtitle' },
  { start: 3700, end: 5900, cameraId: 's3_group', speaker: 'guide', listener: 'watcher', text: 'The builder walks across one clean lane.', emotion: 'calm', gesture: 'point', mode: 'subtitle', move: { id: 'builder', start: 3700, end: 5900, from: { x: 0, y: 245 }, to: { x: 125, y: 245 }, action: 'walk', view: 'side', flipX: false } },
  { start: 6100, end: 8000, cameraId: 's3_builder_medium', speaker: 'watcher', listener: 'builder', text: 'Medium shots show faces without swallowing the world.', emotion: 'attentive', gesture: 'react_nod', mode: 'subtitle' },
  { start: 8200, end: 9900, cameraId: 's3_prop_safe', speaker: 'builder', listener: 'guide', text: 'The idea moves like a small sun, not a giant accident.', emotion: 'excited', gesture: 'show_prop', mode: 'subtitle', prop: { id: 'idea_sun', propType: 'ball', action: 'throw', start: 8350, end: 9750, from: { x: 0, y: 135 }, to: { x: -170, y: 145 }, height: 55, size: 16, color: '#ffe36e' } },
  { start: 10000, end: 12000, cameraId: 's3_master', speaker: 'guide', listener: 'builder', text: 'This is the new base for the animation generator.', emotion: 'happy', gesture: 'explain', mode: 'subtitle' }
];
