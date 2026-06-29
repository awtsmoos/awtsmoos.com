// B"H
import { programsByExtension, defaultPrograms, programs } from '../../basicPrograms.js';
export default ({ os, content, extension } = {}) => {
  const { filePath, fileTitle } = content; let compatiblePrograms = programsByExtension[extension] || [];
  if (!compatiblePrograms.length) compatiblePrograms.push('advancedCodeEditor'); if (!compatiblePrograms.includes('advancedCodeEditor')) compatiblePrograms.push('advancedCodeEditor');
  let selectedProgram = defaultPrograms[extension] || compatiblePrograms[0]; const container = document.createElement('div');
  container.style.cssText = `padding:20px;font-family:'Segoe UI',sans-serif;display:flex;flex-direction:column;gap:15px;height:100%;background:#f0f0f0`;
  const title = document.createElement('h3'); title.textContent = `How do you want to open "${fileTitle}"?`; title.style.marginTop = '0'; container.appendChild(title);
  const programList = document.createElement('div'); programList.style.cssText = 'display:flex;flex-direction:column;gap:10px;flex-grow:1;border:1px solid #ddd;background:white;padding:10px;border-radius:5px';
  compatiblePrograms.forEach(progName => programList.appendChild(programButton(progName, programList, () => selectedProgram = progName)));
  const buttons = document.createElement('div'); buttons.style.cssText = 'display:flex;justify-content:flex-end;gap:10px;flex-shrink:0';
  const onceButton = actionButton('Just once', false), alwaysButton = actionButton('Always', true); buttons.append(onceButton, alwaysButton); container.append(programList, buttons);
  const openFile = async programToUse => { const full = joinVfsPath(filePath, fileTitle); const got = await os.vfs.read(full); os.addWindow({ title:fileTitle, content:got.content, path:filePath, os, programName:programToUse }); container.closest(`.${window.awtsmoosWindowID}-window`)?.querySelector('.close')?.click(); };
  onceButton.onclick = () => openFile(selectedProgram); alwaysButton.onclick = async () => { await os.updateDefaultProgram(extension, selectedProgram); await openFile(selectedProgram); };
  programList.querySelector(`button[data-prog-name="${selectedProgram}"]`)?.click(); return { div:container };
};
function programButton(progName, list, select) { const button = document.createElement('button'); button.textContent = programs[progName]?.name || progName; button.dataset.progName = progName; button.style.cssText = 'padding:12px;border:2px solid transparent;border-radius:5px;cursor:pointer;background:#f9f9f9;text-align:left;font-size:16px'; button.onclick = () => { select(); list.querySelectorAll('button').forEach(btn => { btn.style.borderColor = btn.dataset.progName === progName ? '#0078d7' : 'transparent'; btn.style.fontWeight = btn.dataset.progName === progName ? 'bold' : 'normal'; }); }; return button; }
function actionButton(text, primary) { const b = document.createElement('button'); b.textContent = text; b.style.cssText = `padding:8px 16px;border:1px solid ${primary ? '#0078d7' : '#ccc'};background:${primary ? '#0078d7' : 'white'};color:${primary ? 'white' : 'black'};border-radius:5px;cursor:pointer`; return b; }
function joinVfsPath(path = '/', title = '') { return `/${[path, title].join('/').split('/').filter(Boolean).join('/')}`; }
/** B"H: open-with now reads through VFS, so the chosen app receives the mounted truth. */
