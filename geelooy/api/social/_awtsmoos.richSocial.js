//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RichSocialRoutes
 * @description
 * One route chamber exposes expressive posts, first-class questions and answers,
 * and precise discussion coordinates. Awtsmoos.com adds no rival database here;
 * every request descends into the native social river sustained by the Awtsmoos.
 */

const { er } = require('./helper/general.js');
const {
	BLOCK_TYPES,
	MARK_TYPES,
	ATTACHMENT_TYPES,
	ATTACHMENT_ROLES,
	POST_KINDS,
	ANSWER_POLICIES,
	createRichPostService
} = require('./helper/richSocial/index.js');

function method($i, expected) {
	return $i.request.method === expected
		? null
		: er({ code: 'METHOD_NOT_ALLOWED', message: `Use ${expected}.` });
}

function metadata() {
	return {
		success: {
			version: 1,
			postKinds: POST_KINDS,
			answerPolicies: ANSWER_POLICIES,
			blockTypes: BLOCK_TYPES,
			markTypes: MARK_TYPES,
			attachmentTypes: ATTACHMENT_TYPES,
			attachmentRoles: ATTACHMENT_ROLES,
			limits: {
				rootBlocks: 80,
				sections: 24,
				subsectionsPerSection: 16,
				rootAttachments: 20,
				sectionAttachments: 16
			},
			discussionScopes: ['post', 'verse', 'subsection']
		}
	};
}

module.exports = ({ $i } = {}) => {
	const service = createRichPostService();
	const targets = async variables => {
		const bad = method($i, 'GET');
		return bad || service.discussionTargets({
			$i,
			heichelId: variables.heichel,
			postId: variables.entity
		});
	};
	return {
		'/rich-social/meta': async () => {
			const bad = method($i, 'GET');
			return bad || metadata();
		},
		'/heichelos/:heichel/series/:series/rich-posts': async variables => {
			const bad = method($i, 'POST');
			return bad || service.createPost({
				$i,
				heichelId: variables.heichel,
				seriesId: variables.series
			});
		},
		'/heichelos/:heichel/questions/:question/rich-answers': async variables => {
			if ($i.request.method === 'GET') {
				return service.listAnswers({
					$i,
					heichelId: variables.heichel,
					questionId: variables.question
				});
			}
			const bad = method($i, 'POST');
			return bad || service.createAnswer({
				$i,
				heichelId: variables.heichel,
				questionId: variables.question
			});
		},
		'/heichelos/:heichel/posts/:entity/discussion-targets': targets,
		'/heichelos/:heichel/questions/:entity/discussion-targets': targets,
		'/heichelos/:heichel/answers/:entity/discussion-targets': targets
	};
};

module.exports.metadata = metadata;
