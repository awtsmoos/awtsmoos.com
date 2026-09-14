// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file run.cjs
 * @description Terminal entry for the Awtsmoos product-readiness inventory. Detailed
 * JSON may be directed to a temporary path while terminal output stays deliberately bounded.
 */

const fs = require("fs");
const path = require("path");
const { auditProducts } = require("./ProductReadinessAudit.cjs");

const root = path.resolve(process.argv[2] || process.cwd());
const products = auditProducts(root);
const summary = summarize(products);
console.log(`B"H products=${products.length} average=${summary.average} grades=${JSON.stringify(summary.grades)}`);
for (const product of products.slice(0, 20)) {
	console.log(`${String(product.score).padStart(3)} ${product.grade} ${product.route} ${product.findings.map(item => item.id).join(",") || "ready"}`);
}
const outputArg = process.argv.find(argument => argument.startsWith("--json="));
if (outputArg) {
	const output = path.resolve(outputArg.slice("--json=".length));
	fs.writeFileSync(output, JSON.stringify({ summary, products }, null, 2));
	console.log(`json=${output}`);
}

function summarize(products) {
	const grades = {};
	let total = 0;
	for (const product of products) {
		total += product.score;
		grades[product.grade] = (grades[product.grade] || 0) + 1;
	}
	return Object.freeze({
		products: products.length,
		average: products.length ? Math.round(total / products.length) : 0,
		grades
	});
}
