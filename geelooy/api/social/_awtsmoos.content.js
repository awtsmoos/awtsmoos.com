// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file _awtsmoos.content.js
 * @description
 * Public content enters moderation when required and otherwise becomes one rich
 * entity plus one canonical series record visible to every Awtsmoos social API.
 */

const {
	createAnswer,
	createPost,
	createQuestion,
	createRepost,
	createSection,
	listAnswers,
	listSections
} = require('./helper/socialContent.js');
const {
	answerSeries,
	needs,
	submitOrCreate,
	validateSections
} = require('./helper/contentRouteSupport.js');
const { er } = require('./helper/general.js');

module.exports = ({ $i } = {}) => ({
	'/content/heichelos/:heichel/posts': async values => {
		const bad = needs($i.request.method, 'POST') || validateSections($i);
		return bad || submitOrCreate({
			$i,
			heichelId: values.heichel,
			contentType: 'post',
			create: scoped => createPost({ $i: scoped, heichelId: values.heichel })
		});
	},
	'/content/heichelos/:heichel/questions': async values => {
		const bad = needs($i.request.method, 'POST') || validateSections($i);
		return bad || submitOrCreate({
			$i,
			heichelId: values.heichel,
			contentType: 'question',
			create: scoped => createQuestion({ $i: scoped, heichelId: values.heichel })
		});
	},
	'/content/heichelos/:heichel/questions/:question/answers': async values => {
		if ($i.request.method === 'GET') {
			return listAnswers({
				$i,
				heichelId: values.heichel,
				questionId: values.question,
				seriesId: answerSeries($i)
			});
		}
		if ($i.request.method !== 'POST') {
			return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
		}
		const bad = validateSections($i);
		return bad || submitOrCreate({
			$i,
			heichelId: values.heichel,
			contentType: 'answer',
			extra: { questionId: values.question },
			create: scoped => createAnswer({
				$i: scoped,
				heichelId: values.heichel,
				questionId: values.question
			})
		});
	},
	'/content/heichelos/:heichel/posts/:post/sections': async values => {
		if ($i.request.method === 'GET') {
			return listSections({ $i, heichelId: values.heichel, postId: values.post });
		}
		if ($i.request.method === 'POST') {
			return createSection({ $i, heichelId: values.heichel, postId: values.post });
		}
		return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
	},
	'/content/repost': async () => {
		const bad = needs($i.request.method, 'POST');
		return bad || createRepost({ $i });
	},
	'/content/share': async () => {
		const bad = needs($i.request.method, 'POST');
		if (bad) return bad;
		$i.$_POST.kind = $i.$_POST.kind || 'crossLinks';
		return createRepost({ $i });
	}
});
