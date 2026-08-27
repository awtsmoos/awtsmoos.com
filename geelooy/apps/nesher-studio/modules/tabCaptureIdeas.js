/* B"H
Tab capture routes, honest to browser law: permission first, then streams become sparks.
*/
export const tabCaptureRoutes = [
  {
    id: 'display-media',
    name: 'Browser picker capture',
    summary: 'Use getDisplayMedia so the user chooses a tab/window/screen and Nesher receives a MediaStream.'
  },
  {
    id: 'chrome-extension',
    name: 'Chrome extension bridge',
    summary: 'Extension uses chrome.tabCapture for the active tab and hands a stream to a controlled recorder page.'
  },
  {
    id: 'tunnel-assisted',
    name: 'Tunnel-assisted capture workflow',
    summary: 'Tunnel lists/focuses tabs and launches an extension-enabled Chrome profile, while the extension captures with permission.'
  }
];

export async function makeDisplayMediaSource() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  const video = Object.assign(document.createElement('video'), { autoplay: true, muted: true, playsInline: true, srcObject: stream });
  await video.play();
  return { stream, video };
}
