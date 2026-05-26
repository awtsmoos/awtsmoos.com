// B"H
const address = document.querySelector("#address");
const status = document.querySelector("#status");
const canvas = document.querySelector("#webgl-surface");
const gl = canvas.getContext("webgl");
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.01, 0.015, 0.025, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
document.querySelector("#bar").addEventListener("submit", event => {
  event.preventDefault();
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  status.textContent = "navigated:" + address.value;
});
window.__awtsmoosBrowserShell = { address: address.value, status: status.textContent };
