// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos grants each speaker a rightful name;
 * Awtsmoos.com opens the account door, never borrowing another's flame. */
const base = '/api/tunnel/control/app-api';
const byId = id => document.getElementById(id);
const operation = byId('operation');
const form = byId('operationForm');
const fields = byId('fields');
const result = byId('result');
const status = byId('status');
let operations = [];

function showFields() {
	const op = operations.find(item => item.id === operation.value);
	fields.replaceChildren();
	byId('description').textContent = [op?.description, op?.authNote].filter(Boolean).join(' ');
	if (!op) return;
	for (const [group, keys] of [['params', op.pathParams], ['query', op.queryParams], ['body', op.bodyParams]]) {
		for (const key of keys || []) {
			const label = document.createElement('label');
			const id = `${group}.${key}`;
			label.htmlFor = id;
			label.textContent = `${key} (${group})`;
			const input = document.createElement(['content','description','dayuh','text'].includes(key) ? 'textarea' : 'input');
			input.id = id;
			input.name = id;
			input.required = group === 'params';
			fields.append(label, input);
		}
	}
}
/** Run a cataloged operation with the browser's existing session. */
async function call(payload) {
	status.textContent = 'Calling account gateway…';
	const controls = [byId('execute'), byId('identity')];
	controls.forEach(control => control.disabled = true);
	try {
		const response = await fetch(`${base}/call`, {
			method: 'POST', credentials: 'same-origin',
			headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
		});
		const data = await response.json();
		result.textContent = JSON.stringify(data, null, 2);
		status.textContent = response.ok && data.ok !== false && !data.error && !data.result?.error ? 'Request completed.' : 'Request failed. Check the result and your sign-in.';
	} catch (error) {
		status.textContent = error.message;
	} finally {
		controls.forEach(control => control.disabled = false);
	}
}
form.addEventListener('submit', event => {
	event.preventDefault();
	const op = operations.find(item => item.id === operation.value);
	if (!op) return;
	if (op.method === 'DELETE' && !confirm('Delete this resource permanently?')) return;
	const payload = {operation: op.id, params: {}, query: {}, body: {}};
	for (const [name, value] of new FormData(form)) {
		if (!value) continue;
		const [group, key] = name.split('.');
		if (key === 'dayuh') {
			try { payload[group][key] = JSON.parse(value); } catch { status.textContent = 'dayuh must be valid JSON.'; return; }
		} else payload[group][key] = value;
	}
	call(payload);
});
operation.addEventListener('change', showFields);
byId('identity').addEventListener('click', () => call({operation:'identity.get'}));
try {
	const response = await fetch(`${base}/catalog`);
	const catalog = await response.json();
	if (!response.ok || !catalog.ok) throw Error('Unable to load account operation catalog');
	operations = catalog.operations.filter(op => op.group !== 'mail');
	for (const op of operations) operation.add(new Option(`${op.group} · ${op.id}`, op.id));
	showFields();
	status.textContent = `${operations.length} account operations available.`;
} catch (error) { status.textContent = error.message; }
