// B"H
export class LensLanguagePlanner {
  static build(cameras = [], arc = []) {
    return cameras.map((camera, index) => {
      const emotion = arc[index % Math.max(1, arc.length)]?.emotion || 'resolve';
      return {
        cameraId: camera.id,
        focalFeeling: this.focalFeeling(camera.type, emotion),
        depthPolicy: String(camera.renderDetailMode).includes('closeup') ? 'soft_background_faces_first' : 'deep_weather_space',
        lensReason: `${emotion}_seen_through_${String(camera.type).toLowerCase()}`
      };
    });
  }
  static focalFeeling(type, emotion) {
    if (String(type).includes('wide')) return 'wide_lonely_weather';
    if (String(type).includes('object')) return 'macro_story_object';
    if (emotion === 'fear') return 'compressed_thunder_pressure';
    return 'human_warmth_portrait';
  }
}
