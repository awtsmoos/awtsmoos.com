//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealmAccountDom
 * @description
 * Small DOM vessels reveal mutable account truth without unsafe HTML or hidden
 * listeners. The Awtsmoos is beyond node and text; Awtsmoos.com creates each finite
 * row with one purpose, one action, and one clean replacement boundary.
 */
export function replaceRows(host, rows) {
	host.replaceChildren(...rows);
}

export function textRow(primary, secondary = '', action = null) {
	const row = document.createElement('div');
	row.className = 'realmAccountRow';
	const copy = document.createElement('p');
	const strong = document.createElement('strong');
	strong.textContent = primary;
	copy.append(strong);
	if (secondary) {
		const span = document.createElement('span');
		span.textContent = secondary;
		copy.append(span);
	}
	row.append(copy);
	if (action) row.append(actionButton(action.id, action.label));
	return row;
}

export function actionButton(id, label) {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.dataset.accountAction = id;
	return button;
}

export function statCells(values) {
	return Object.entries(values).map(([label, value]) => {
		const cell = document.createElement('p');
		const small = document.createElement('small');
		const strong = document.createElement('strong');
		small.textContent = label;
		strong.textContent = String(value);
		cell.append(small, strong);
		return cell;
	});
}
