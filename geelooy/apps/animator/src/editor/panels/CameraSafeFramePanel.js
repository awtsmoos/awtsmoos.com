// B"H
export class CameraSafeFramePanel { static model(camera = {}) { return { title: 'Camera Safe Frame', x: camera.x, y: camera.y, zoom: camera.zoom, shot: camera.shotType || camera.shot }; } }
