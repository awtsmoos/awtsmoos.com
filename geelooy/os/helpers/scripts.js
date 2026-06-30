//B"H

export { loadFiles, importFiles };

async function importFiles({ os, path, system } = {}) {
  const count = await loadFiles(async file => {
    const content = await readFileContent(file);
    await os.createFile({ path, title:file.name, content });
  });
  if (count) await notify(system, `${count} file(s) imported successfully.`);
  return count;
}

function loadFiles(callback) {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      for (const file of files) await callback?.(file);
      input.remove();
      resolve(files.length);
    };
    input.addEventListener('cancel', () => { input.remove(); resolve(0); });
    input.click();
  });
}

async function readFileContent(file) {
  const isText = file.type.startsWith('text/') || /json|javascript|xml/.test(file.type);
  return isText ? await file.text() : await file.arrayBuffer();
}

async function notify(system, text) {
  if (system?.makeToast) return await system.makeToast(text, 'success', 'local');
  globalThis.os?.taskbar?.notify?.(text, 'success');
}

/** B"H: importing files reports through OS vessels, never through a blocking browser modal. */
