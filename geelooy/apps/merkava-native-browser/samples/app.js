// B"H
const canvas = document.querySelector("#stage");
const status = document.querySelector("#status");
const gl = canvas.getContext("webgl");
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.02, 0.08, 0.16, 1);
gl.clear(gl.COLOR_BUFFER_BIT);
document.querySelector("#draw").addEventListener("click", () => {
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  status.textContent = "drawn";
});
window.__awtsmoosResult = { status: status.textContent, commands: canvas.toJSON().webgl.commands.length };
