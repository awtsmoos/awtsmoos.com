/* B"H
 * NLE DOM vessels.
 * Time receives ruler, playhead, edit buttons, and benchmark proof.
 */
import { mapIds } from './element.js';

export function nleDom() {
  return mapIds(['nleBin','nleTimeline','nleSelectionSummary','nleExport','addBinAsset','addTimelineClip','splitClip','trimClipShorter','nudgeClipLeft','nudgeClipRight','moveClipTrack','rippleDeleteClip','duplicateClip','snapClipPrev','snapClipNext','fadeClip','toggleClipMute','toggleClipDisabled','addMarker','nleJumpStart','nlePlayheadBack','nlePlayheadForward','nleJumpEnd','nleZoomOut','nleZoomIn','prepareExport','runEncodingBenchmark','runSmokeEncodingBenchmark','encodingBenchmarkOutput']);
}
