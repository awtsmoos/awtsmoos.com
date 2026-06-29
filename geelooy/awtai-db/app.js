// B"H
const fileInput = document.getElementById("file");
const button = document.getElementById("convert");
const link = document.getElementById("download");
const log = document.getElementById("log");
let selected = null;

function write(value) {
  log.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

fileInput.addEventListener("change", () => {
  selected = fileInput.files && fileInput.files[0];
  button.disabled = !selected;
  link.hidden = true;
  write(selected ? { file: selected.name, bytes: selected.size, status: "ready" } : "B'H Waiting for GGUF...");
});

button.addEventListener("click", async () => {
  if (!selected) return;
  try {
    button.disabled = true;
    write("B'H Reading and converting. Large GGUF files may take a while...");
    const result = await AwtaiDb.convertBrowserFile(selected);
    const blob = new Blob([result.bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = selected.name.replace(/\.gguf$/i, "") + ".awtai-db";
    link.hidden = false;
    write({
      status: "converted",
      tensors: result.manifest.tensors.length,
      packets: result.manifest.packets.length,
      outputBytes: result.bytes.length,
      diskFirst: result.manifest.diskFirst
    });
  } catch (error) {
    write("B'H Conversion failed: " + (error && error.stack || error));
  } finally {
    button.disabled = false;
  }
});
