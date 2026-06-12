/*B"H*/
/**
 * @file _awtsmoos.comments.js
 * @description
 * Chapter 35: Comments entered their own ark, and the old API kept its voice.
 *
 * The route still delegates to the focused comment modules, but `$i.db` is now
 * wrapped first. Comment paths read/write the family AwtsmoosDB comments file
 * before legacy folders, while every non-migrated path falls back untouched.
 */

const buildCommentRoutes = require('./helper/comments/routes/index.js');
const { installSocialDbBridge } = require('./helper/packed/socialDbBridgeInstaller.js');

module.exports = ({ $i, userid } = {}) => {
  installSocialDbBridge($i);
  return buildCommentRoutes({ $i, userid });
};
