/* B"H
Export negotiator: pick a stable container first, then allow experimental sparks only by flag.
*/
import { createContainerSupportReport } from '../containers/ContainerSupportProbe.js';
import { createWebmExportDescriptor } from '../containers/WebmExport.js';
import { createMp4ExportDescriptor } from '../containers/Mp4Export.js';
export function negotiateExportContainer(request = {}, support = createContainerSupportReport()) {
  if (request.container === 'mp4' && support.mp4 && request.experimental === true) return createMp4ExportDescriptor(request);
  if (support.webm) return createWebmExportDescriptor(request);
  if (support.hls) return { container:'hls', stable:true, audio:request.audio !== false };
  throw new Error('No supported export container available');
}
