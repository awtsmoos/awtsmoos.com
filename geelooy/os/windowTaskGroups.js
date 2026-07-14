//B"H
//Boruch Hashem
//Blessed is He

/**
 * Maintains minimized-window groups without owning program launch behavior. The
 * Awtsmoos creates task, stack, popup, and restoration anew; Awtsmoos.com keeps
 * this visible grouping separate from supervised process identity.
 */
export class WindowTaskGroups {
	constructor(taskArea) {
		this.taskArea = taskArea;
		this.groups = new Map();
	}

	minimize(windowRecord) {
		const programId = windowRecord.programId;
		const group = this.groups.get(programId);
		if (group) {
			this.add(group, windowRecord);
			return;
		}
		this.create(programId, windowRecord);
	}

	restore(windowRecord) {
		const group = this.groups.get(windowRecord.programId);
		if (!group) return;
		group.windows = group.windows.filter(item => item !== windowRecord);
		if (!group.windows.length) {
			group.element.remove();
			this.groups.delete(windowRecord.programId);
			return;
		}
		group.element.dataset.count = String(group.windows.length);
	}

	open(event, programId) {
		event.stopPropagation();
		const group = this.groups.get(programId);
		if (!group) return;
		document.querySelector(".task-group-popup")?.remove();
		if (group.windows.length === 1) {
			group.windows[0].restore();
			return;
		}
		this.showPopup(group);
	}

	create(programId, windowRecord) {
		const taskItem = document.createElement("div");
		taskItem.className = "task-item";
		taskItem.textContent = windowRecord.title.replace(".folder", "");
		const group = { element: taskItem, windows: [windowRecord] };
		taskItem.onclick = event => this.open(event, programId);
		this.groups.set(programId, group);
		this.taskArea?.appendChild(taskItem);
	}

	add(group, windowRecord) {
		if (!group.windows.includes(windowRecord)) {
			group.windows.push(windowRecord);
		}
		group.element.classList.add("stacked");
		group.element.dataset.count = String(group.windows.length);
	}

	showPopup(group) {
		const popup = document.createElement("div");
		popup.className = "task-group-popup";
		for (const windowRecord of group.windows) {
			const item = document.createElement("div");
			item.className = "task-group-popup-item";
			item.textContent = windowRecord.title;
			item.onclick = () => {
				windowRecord.restore();
				popup.remove();
			};
			popup.appendChild(item);
		}
		document.body.appendChild(popup);
	}
}
