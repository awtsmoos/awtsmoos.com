
// B"H
/**
 * @file PosePart.js
 * @description The global resting or active bodily state.
 */
export const PosePart = {
  label: 'Character Pose',
  type: 'select',
  options: [
    { id: 'standing', label: 'Standing' },
    { id: 'sitting', label: 'Sitting' },
    { id: 'waving', label: 'Waving' },
    { id: 'walking', label: 'Walking' }
  ]
};
