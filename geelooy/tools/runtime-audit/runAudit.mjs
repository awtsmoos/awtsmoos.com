//B"H
// Boruch Hashem
// Blessed is He
import { TargetSession } from './targetSession.mjs';
import { auditProduct } from './productAudit.mjs';
import { classifyAuditError } from './assertions.mjs';
import { progress } from './reporter.mjs';

/** Runs products serially so each disposable Chrome target has one clear owner. */
export async function runAudit({ products, viewports, baseUrl, devtoolsUrl, timeoutMs }) {
	const results = [];
	for (const product of products) {
		let session;
		try {
			session = await TargetSession.create({ baseUrl, devtoolsUrl, timeoutMs });
			const evidence = await auditProduct({ product, session, baseUrl, viewports });
			results.push({ status: 'completed', ...evidence });
		} catch (error) {
			const classified = classifyAuditError(error);
			progress(`${product.name} ${classified.type}: ${classified.message}`);
			results.push({
				name: product.name,
				path: product.path,
				status: 'failed',
				failureType: classified.type,
				error: classified.message
			});
		} finally {
			await session?.close();
		}
	}
	return { createdAt: new Date().toISOString(), baseUrl, devtoolsUrl, results };
}
