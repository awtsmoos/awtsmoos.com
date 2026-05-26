// B"H
const canvas = document.querySelector("#merkava-canvas");
canvas.width = 96;
canvas.height = 48;

const brush = canvas.getContext("2d");
brush.fillStyle = "#123456";
brush.fillRect(4, 6, 24, 18);
brush.fillStyle = "#e0f7ff";
brush.fillText("B\"H", 8, 20);

const gl = canvas.getContext("webgl");
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.07, 0.2, 0.33, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const button = document.querySelector("#ignite");
const output = document.querySelector("#result");
button.addEventListener("click", () => {
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  output.textContent = "canvas-awake";
});

if (!canvas.__webglCanvasTexture) throw new Error("canvas texture missing");
if (!canvas.toJSON().webgl.commands.some(command => command.op === "clear")) {
  throw new Error("webgl clear command missing");
}

window.__awtsmoosResult = {
  canvasTag: canvas.tagName,
  webglCommands: canvas.toJSON().webgl.commands.length,
  textureOps: canvas.__webglCanvasTexture.commands.length,
  outputText: output.textContent
};
