// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationAnnotationRoutes
 * @description Routes for phrase-anchored translation annotations — a
 * distinct type from discussion comments (worker G, 2026-10-21). Writes are
 * authenticated (session or OAuth bearer) with alias-ownership verification;
 * reads follow the public comment-read convention.
 */
const { er, methodIs } = require('./utils.js');
const annotations = require('../translationAnnotations.js');

module.exports = ({ $i, userid }) => ({
	'/heichelos/:heichel/series/:series/post/:post/translation-annotations': async v => {
		if (methodIs($i, 'GET')) {
			return annotations.listForPost({
				$i, heichelId: v.heichel, postId: v.post,
				language: $i.$_GET?.language,
				authorAliasId: $i.$_GET?.authorAliasId,
				sectionId: $i.$_GET?.sectionId
			});
		}
		if (methodIs($i, 'POST')) {
			return annotations.addAnnotation({
				$i, userid, heichelId: v.heichel, seriesId: v.series, postId: v.post,
				body: $i.$_POST || {}
			});
		}
		return er({ message: 'Method Not Allowed', code: 405 });
	},
	'/heichelos/:heichel/series/:series/post/:post/translation-annotations/by-phrase/:sectionId/:phraseId': async v => {
		if (!methodIs($i, 'GET')) return er({ message: 'GET only request', code: 'GET_ONLY' });
		return annotations.listForPhrase({
			$i, heichelId: v.heichel, postId: v.post,
			sectionId: v.sectionId, phraseId: v.phraseId
		});
	},
	'/heichelos/:heichel/series/:series/post/:post/translation-annotations/by-unit/:unitIndex/:phraseIndex': async v => {
		if (!methodIs($i, 'GET')) return er({ message: 'GET only request', code: 'GET_ONLY' });
		return annotations.listForPhrase({
			$i, heichelId: v.heichel, postId: v.post,
			unitIndex: v.unitIndex, phraseIndex: v.phraseIndex
		});
	},
	'/heichelos/:heichel/series/:series/post/:post/translation-annotations/:annotationId': async v => {
		if (methodIs($i, 'PUT')) {
			return annotations.updateAnnotation({
				$i, userid, heichelId: v.heichel, postId: v.post,
				annotationId: v.annotationId, body: $i.$_PUT || $i.$_POST || {}
			});
		}
		if (methodIs($i, 'DELETE')) {
			return annotations.deleteAnnotation({
				$i, userid, heichelId: v.heichel, postId: v.post,
				annotationId: v.annotationId
			});
		}
		return er({ message: 'Method Not Allowed', code: 405 });
	}
});
