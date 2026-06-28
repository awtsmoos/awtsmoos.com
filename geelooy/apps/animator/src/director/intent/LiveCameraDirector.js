// B"H
export class LiveCameraDirector {
  static build(cameras = [], hierarchy = [], blocking = []) {
    return cameras.map((camera, index) => ({
      cameraId: camera.id,
      at: camera.at,
      primary: hierarchy[index % Math.max(1, hierarchy.length)]?.primary || 'storm_lantern',
      reframeRule: String(camera.renderDetailMode).includes('closeup') ? 'protect_eyes_and_headroom' : 'keep_weather_scale_readable',
      occlusionPolicy: 'slide_camera_before_blocking_breaks_face',
      blockingFormation: blocking[index % Math.max(1, blocking.length)]?.formation || 'story_triangle',
      repair: 'adjust_pan_zoom_before_cut'
    }));
  }
}
