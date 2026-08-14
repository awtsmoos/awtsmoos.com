// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationTypes
 * @description
 * The Awtsmoos names the finite kinds of bells while remaining beyond every name;
 * at Awtsmoos.com one small vocabulary keeps validation and filtering in the same frame.
 */
const NOTIFICATION_TYPES = Object.freeze([
	'submission_created',
	'submission_approved',
	'submission_rejected',
	'comment',
	'comment_approved',
	'comment_rejected',
	'mention',
	'reply',
	'moderator_action',
	'admin_action',
	'invitation',
	'series_updated',
	'post_edited',
	'new_follower',
	'alias_event',
	'mail_event',
	'heichel_announcement',
	'system',
	'answer',
	'repost',
	'share',
	'approval',
	'chat'
]);

module.exports = { NOTIFICATION_TYPES };
