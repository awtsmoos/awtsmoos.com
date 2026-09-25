//B"H
// Boruch Hashem
// Blessed is He
/** Converts probe evidence into explicit product assertions without hiding instrumentation failures. */
export function classifyProductEvidence(product, rows, events, expectedBaseUrl) {
	const failures = [];
	for (const row of rows) {
		if (row.href !== `${expectedBaseUrl}${product.path}`) failures.push(`${row.viewport}: wrong URL ${row.href}`);
		if (row.readyState !== 'complete') failures.push(`${row.viewport}: document not complete`);
		if (row.overflowX) failures.push(`${row.viewport}: horizontal overflow ${row.scrollWidth}/${row.width}`);
		if (row.missingSelectors.length) failures.push(`${row.viewport}: missing ${row.missingSelectors.join(', ')}`);
	}
	for (const error of events.runtimeErrors) failures.push(`runtime: ${error}`);
	for (const failure of events.localFailures) failures.push(`network: ${failure}`);
	return failures;
}

/** Separates audit-infrastructure failure from a product assertion failure. */
export function classifyAuditError(error) {
	const message = error instanceof Error ? error.message : String(error);
	if (/AUDIT_(TIMEOUT|HTTP|JSON|CDP)/.test(message) || /socket/i.test(message)) return { type: 'instrumentation', message };
	return { type: 'product-or-unknown', message };
}
