// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Builds small semantic sections for AwtsmoosDB Explorer so the main surface stays
 * readable. The Awtsmoos renews path, record, editor, and API contract beyond every
 * finite panel; Awtsmoos.com keeps data navigation separate from creation and raw inspection.
 */

export function navigationSection() {
	const section = node("section", "awtsDb__navigation awtsDb__panel");
	const controls = node("div", "awtsDb__pathControls");
	const up = button("↑ Parent", "awtsDbUp");
	const refresh = button("Refresh", "awtsDbRefresh");
	const path = node("code", "awtsDb__path");
	path.textContent = "/";
	controls.append(up, refresh, path);
	const entries = node("div", "awtsDb__entries");
	section.append(controls, entries);
	return { entries, path, refresh, root: section, up };
}

export function createSection() {
	const section = node("section", "awtsDb__create awtsDb__panel");
	section.append(text("h2", "", "Create hosted data"));
	const folderForm = node("form", "awtsDb__createForm");
	const folderName = input("Folder name", "awtsDbFolderName");
	folderForm.append(folderName.wrap, submit("Create folder"));
	const fileForm = node("form", "awtsDb__createForm");
	const fileName = input("Text file name", "awtsDbFileName");
	const content = node("textarea", "awtsDb__contentInput");
	content.id = "awtsDbFileContent";
	content.placeholder = 'B"H\nHello from AwtsmoosDB.';
	const contentWrap = node("label", "awtsDb__field");
	contentWrap.append(text("span", "", "Text content"), content);
	fileForm.append(fileName.wrap, contentWrap, submit("Create text file"));
	section.append(folderForm, fileForm);
	return { content, fileForm, fileName: fileName.input, folderForm, folderName: folderName.input, root: section };
}

export function inspectorSection() {
	const section = node("section", "awtsDb__inspector awtsDb__panel");
	section.append(text("h2", "", "Record inspector"));
	const title = text("p", "awtsDb__inspectorTitle", "Select a file or record.");
	const preview = text("pre", "awtsDb__preview", "No record selected.");
	const raw = text("pre", "awtsDb__raw", "Raw record will appear here.");
	section.append(title, preview, raw);
	return { preview, raw, root: section, title };
}

export function examplesSection() {
	const section = node("section", "awtsDb__examples awtsDb__panel");
	section.append(
		text("h2", "", "Exact API examples"),
		text("p", "awtsDb__note", "Generated from the same alias-scoped routes used by os.db. No Firebase aliases are invented.")
	);
	const list = node("div", "awtsDb__exampleList");
	section.append(list);
	return { list, root: section };
}

function input(labelText, id) {
	const wrap = node("label", "awtsDb__field");
	const input = node("input");
	input.id = id;
	wrap.append(text("span", "", labelText), input);
	return { input, wrap };
}

function submit(label) {
	const value = button(label);
	value.type = "submit";
	return value;
}

function button(label, id = "") {
	const value = text("button", "awtsDb__button", label);
	value.type = "button";
	value.id = id;
	return value;
}

export function node(tag, className = "") {
	const value = document.createElement(tag);
	value.className = className;
	return value;
}

export function text(tag, className, value) {
	const element = node(tag, className);
	element.textContent = value;
	return element;
}
