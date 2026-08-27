/* B"H
Responsive component helpers: mobile and desktop panels speak the same data,
only the layout breath changes. Touch is first-class, not an afterthought.
*/
export function createResponsiveShell(input = {}) {
  const width = Number(input.width || 1280);
  const mode = input.mode || (width < 760 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop');
  return { kind:'ResponsiveShell', mode, width, touch:input.touch ?? mode !== 'desktop', panels:panelOrder(mode) };
}
export function panelOrder(mode) {
  if (mode === 'mobile') return ['ProgramMonitor','TimelinePanel','SourcePanel','StreamPanel','ExportPanel'];
  if (mode === 'tablet') return ['PreviewMonitor','ProgramMonitor','TimelinePanel','BinPanel','StreamPanel','ExportPanel'];
  return ['ProjectPanel','ScenePanel','SourcePanel','PreviewMonitor','ProgramMonitor','TimelinePanel','AudioMixerPanel','EffectsPanel','ColorPanel','StreamPanel','ExportPanel','StatsPanel'];
}
export function createTouchEventMap(input = {}) {
  return { drag:'pointermove', trim:'pointermove', tap:'pointerup', longPressMs:input.longPressMs || 450, wheelZoom:input.wheelZoom ?? true, pinchZoom:input.pinchZoom ?? true };
}
export const componentModuleStatus = 'responsive-working';
