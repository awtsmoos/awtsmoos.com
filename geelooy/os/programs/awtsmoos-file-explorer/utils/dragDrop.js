// B"H
import { joinExplorerPath } from '../api/path.js';

export const handleDragStart = (e, itemPath, isSelected, body) => {
  const selected = isSelected ? [...body.querySelectorAll('.selected')].map(el => el.dataset.path).filter(Boolean) : [itemPath];
  if (!isSelected) body.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
  e.currentTarget?.classList?.add('selected');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('application/json', JSON.stringify(selected));
};

export const handleDragOver = e => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('drag-over'); };
export const handleDragLeave = e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over'); };

export async function processNativeFiles(filesList, targetFolderPath, os, system, refreshCallback) {
  let imported = 0;
  for (const file of Array.from(filesList)) {
    const text = file.type.startsWith('text/') || /json|javascript|xml/.test(file.type);
    await os.createFile({ path:targetFolderPath, title:file.name, content:text ? await file.text() : await file.arrayBuffer() });
    imported++;
  }
  if (imported) { await system?.makeToast?.(`${imported} file(s) imported.`, 'success', 'local'); refreshCallback?.(); }
}

export async function handleDrop(e, targetFolderPath, os, system, refreshCallback) {
  e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over');
  if (e.dataTransfer.files?.length) return processNativeFiles(e.dataTransfer.files, targetFolderPath, os, system, refreshCallback);
  const data = e.dataTransfer.getData('application/json');
  if (!data) return;
  try {
    const sources = JSON.parse(data); let moved = 0;
    for (const src of Array.isArray(sources) ? sources : []) {
      const dest = joinExplorerPath(targetFolderPath, src.split('/').pop());
      if (src !== dest) { await os.vfs.move(src, dest, { principal:{ id:'drag-drop' } }); moved++; }
    }
    if (moved) refreshCallback?.();
  } catch (error) { system?.makeToast?.(`Failed to move items: ${error.message}`, 'error', 'local'); }
}

export const handlePaste = async (e, path, os, system, refresh) => {
  if (e.clipboardData?.files?.length) { e.preventDefault(); await processNativeFiles(e.clipboardData.files, path, os, system, refresh); }
};

/** B"H: drag and paste now enter through VFS gates, carrying awtsmoos:// paths intact. */
