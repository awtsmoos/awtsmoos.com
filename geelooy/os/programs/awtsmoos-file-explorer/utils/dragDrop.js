// B"H
// Boruch Hashem
// Blessed is He
/** Drag and paste enter Files through VFS gates without silent overwrite or recursive self-moves. */
import { joinExplorerPath } from '../api/path.js';

export function handleDragStart(event, itemPath, isSelected, body) {
	const selected = isSelected
		? [...body.querySelectorAll('.selected')].map(element => element.dataset.path).filter(Boolean)
		: [itemPath];
	if (!isSelected) body.querySelectorAll('.selected').forEach(element => element.classList.remove('selected'));
	event.currentTarget?.classList?.add('selected');
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('application/json', JSON.stringify(selected));
}

export function handleDragOver(event) {
	event.preventDefault();
	event.stopPropagation();
	event.dataTransfer.dropEffect = 'move';
	event.currentTarget.classList.add('drag-over');
}

export function handleDragLeave(event) {
	event.preventDefault();
	event.stopPropagation();
	event.currentTarget.classList.remove('drag-over');
}

export async function processNativeFiles(filesList, targetFolderPath, os, system, refreshCallback) {
	let imported = 0;
	let skipped = 0;
	for (const file of Array.from(filesList)) {
		const destination = joinExplorerPath(targetFolderPath, file.name);
		if (await pathExists(os.vfs, destination)) {
			skipped += 1;
			continue;
		}
		const isText = file.type.startsWith('text/') || /json|javascript|xml/.test(file.type);
		await os.createFile({ path: targetFolderPath, title: file.name, content: isText ? await file.text() : await file.arrayBuffer() });
		imported += 1;
	}
	await reportTransfer(system, { verb: 'imported', completed: imported, skipped });
	if (imported) refreshCallback?.();
	return { imported, skipped };
}

export async function handleDrop(event, targetFolderPath, os, system, refreshCallback) {
	event.preventDefault();
	event.stopPropagation();
	event.currentTarget.classList.remove('drag-over');
	if (event.dataTransfer.files?.length) {
		return processNativeFiles(event.dataTransfer.files, targetFolderPath, os, system, refreshCallback);
	}
	const payload = event.dataTransfer.getData('application/json');
	if (!payload) return { moved: 0, skipped: 0 };
	try {
		return await movePaths(JSON.parse(payload), targetFolderPath, os, system, refreshCallback);
	} catch (error) {
		await system?.makeToast?.(`Failed to move items: ${error.message}`, 'error', 'local');
		return { moved: 0, skipped: 0, error };
	}
}

export async function handlePaste(event, path, os, system, refresh) {
	if (!event.clipboardData?.files?.length) return null;
	event.preventDefault();
	return processNativeFiles(event.clipboardData.files, path, os, system, refresh);
}

async function movePaths(sources, targetFolderPath, os, system, refreshCallback) {
	let moved = 0;
	let skipped = 0;
	for (const source of Array.isArray(sources) ? sources : []) {
		const destination = joinExplorerPath(targetFolderPath, source.split('/').pop());
		if (source === destination || isNestedDestination(source, destination) || await pathExists(os.vfs, destination)) {
			skipped += 1;
			continue;
		}
		await os.vfs.move(source, destination, { principal: { id: 'drag-drop' } });
		moved += 1;
	}
	await reportTransfer(system, { verb: 'moved', completed: moved, skipped });
	if (moved) refreshCallback?.();
	return { moved, skipped };
}

async function pathExists(vfs, path) {
	try {
		await vfs.stat(path, { principal: { id: 'drag-drop' } });
		return true;
	} catch {
		return false;
	}
}

function isNestedDestination(source, destination) {
	const normalized = String(source).replace(/\/+$/, '');
	return destination.startsWith(`${normalized}/`);
}

async function reportTransfer(system, { verb, completed, skipped }) {
	if (!completed && !skipped) return;
	const tone = completed ? 'success' : 'warning';
	const suffix = skipped ? ` ${skipped} skipped to avoid overwrite or recursive move.` : '';
	await system?.makeToast?.(`${completed} item(s) ${verb}.${suffix}`, tone, 'local');
}
