/* B"H */
import { currentScene, makeScene } from './graph/sceneGraph.js';
import { cloneSourceNode } from './graph/sourceNode.js';
import { nextId } from './state.js';
import { dom, setStatus } from './dom.js';
import { drawStage, refreshSources } from './stage.js';
export function bindScenes(state) { dom.addScene.addEventListener('click', () => addScene(state)); dom.duplicateScene.addEventListener('click', () => duplicateScene(state)); refreshScenes(state); }
export function refreshScenes(state) {
  dom.sceneList.innerHTML = ''; state.scenes.forEach(scene => { const li = document.createElement('li'); li.textContent = scene.name; li.className = scene.id === state.currentSceneId ? 'active' : ''; li.onclick = () => switchScene(state, scene.id); dom.sceneList.append(li); });
}
function addScene(state) { const scene = makeScene(nextId('scene'), `Scene ${state.scenes.length + 1}`); state.scenes.push(scene); switchScene(state, scene.id); setStatus(`${scene.name} created.`); }
function duplicateScene(state) { const src = currentScene(state); const sources = src.sources.map(s => cloneSourceNode(s, { id:nextId(s.type), x:s.x + 24, y:s.y + 24 })); const scene = makeScene(nextId('scene'), `${src.name} Copy`, sources); state.scenes.push(scene); switchScene(state, scene.id); setStatus(`${scene.name} duplicated.`); }
function switchScene(state, id) { state.currentSceneId = id; state.selectedId = null; refreshScenes(state); refreshSources(state); drawStage(state); }
