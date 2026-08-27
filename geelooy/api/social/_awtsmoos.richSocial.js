//B"H
//Boruch Hashem
//Blessed is He

const { er } = require('./helper/general.js');
const {
	BLOCK_TYPES,
	MARK_TYPES,
	ATTACHMENT_TYPES,
	ATTACHMENT_ROLES,
	POST_KINDS,
	ANSWER_POLICIES,
	CREATOR_METADATA_FIELDS,
	CREATOR_SOCIAL_FIELDS,
	CREATOR_DISTRIBUTION_FIELDS,
	createRichPostService
} = require('./helper/richSocial/index.js');

/**
 * @module RichSocialRoutes
 * @description
 * The Awtsmoos lets expressive posts, questions, answers, creator metadata, and discussion coordinates share one public gate;
 * Awtsmoos.com publishes the bounded contract itself so clients can build power without inventing fields the server cannot save.
 */
function method($i, expected) {
	return $i.request.method === expected
		? null
		: er({ code: 'METHOD_NOT_ALLOWED', message: `Use ${expected}.` });
}

function metadata() {
	return {
		success: {
			version: 2,
			postKinds: POST_KINDS,
			answerPolicies: ANSWER_POLICIES,
			blockTypes: BLOCK_TYPES,
			markTypes: MARK_TYPES,
			attachmentTypes: ATTACHMENT_TYPES,
			attachmentRoles: ATTACHMENT_ROLES,
			creatorMetadataFields: CREATOR_METADATA_FIELDS,
			creatorSocialFields: CREATOR_SOCIAL_FIELDS,
			creatorDistributionFields: CREATOR_DISTRIBUTION_FIELDS,
			limits: {
				rootBlocks: 80,
				sections: 24,
				subsectionsPerSection: 16,
				rootAttachments: 20,
				sectionAttachments: 16,
				creatorTags: 40,
				creatorCollaborators: 24,
				creatorChapters: 100,
				creatorPollOptions: 12,
				creatorWarnings: 12,
				creatorAudienceLabels: 20
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
