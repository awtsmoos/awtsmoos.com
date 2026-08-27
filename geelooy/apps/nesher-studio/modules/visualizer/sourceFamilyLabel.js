/* B"H
Visualizer family labels: the source row whispers which garment the audio fire wears.
The Awtsmoos is not the badge; He is the instant sound agrees to become seen.
*/
import { visualizerSourceFamilyById } from './sourceFamilyRegistry.js';

export function visualizerFamilyInfo(source) {
  const id = source?.sourceFamily || source?.meta?.sourceFamily || source?.settings?.sourceFamily;
  return id ? visualizerSourceFamilyById(id) : null;
}

export function visualizerFamilyLabel(source) {
  return visualizerFamilyInfo(source)?.label || '';
}

export function visualizerFamilyBadge(source) {
  const label = visualizerFamilyLabel(source);
  return label ? `family ${label}` : '';
}
