/* B"H
 * Stream health DOM vessels.
 * Live output needs a heartbeat that can be read at a glance.
 */
import { mapIds } from './element.js';

export function streamDom() {
  return mapIds(['streamProvider','streamProviderName','providerNote','streamCodec','streamState','streamSession','streamFrames','streamSegments','streamUploaded','streamErrors']);
}
