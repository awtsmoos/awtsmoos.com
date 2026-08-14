// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialBooksRoutes
 * @description Any Awtsmoos series can become a printable codex or a persisted recursive book-generation job.
 */
const { er } = require('./helper/general.js');
const service = require('./helper/books/routeService.js');

function failure(error) {
	return er({
		code: 'BOOK_EXPORT_FAILED',
		message: error.message,
		details: error.stack
	});
}

module.exports = ({ $i, userid } = {}) => ({
	'/heichelos/:heichel/series/:series/books/html': async vars => {
		if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
		try {
			return await service.directHtml({ $i, userid, heichelId: vars.heichel, seriesId: vars.series });
		} catch (error) {
			return failure(error);
		}
	},
	'/heichelos/:heichel/series/:series/books/jobs': async vars => {
		if ($i.request.method !== 'POST') return er({ code: 'METHOD_NOT_ALLOWED' });
		try {
			return service.createJob({ $i, userid, heichelId: vars.heichel, seriesId: vars.series });
		} catch (error) {
			return failure(error);
		}
	},
	'/heichelos/:heichel/series/:series/books/jobs/:job': async vars => {
		if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
		try {
			return service.jobStatus({ jobId: vars.job, heichelId: vars.heichel, seriesId: vars.series });
		} catch (error) {
			return failure(error);
		}
	},
	'/heichelos/:heichel/series/:series/books/jobs/:job/files/:file': async vars => {
		if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
		try {
			return service.jobFile({ $i, jobId: vars.job, heichelId: vars.heichel, seriesId: vars.series, fileName: vars.file });
		} catch (error) {
			return failure(error);
		}
	},
	'/heichelos/:heichel/series/:series/books/jobs/:job/archive.zip': async vars => {
		if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
		try {
			return service.archive({ $i, jobId: vars.job, heichelId: vars.heichel, seriesId: vars.series });
		} catch (error) {
			return failure(error);
		}
	}
});
