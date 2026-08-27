// B"H
/**
 * @module ThoughtStreamsFacade
 * @description
 * Chapter 527: The old import remains one doorway, while smaller chambers
 * behind it carry creation, reading, reaction, measurement, and deletion.
 */
module.exports = {
  ...require('./thoughtStreams/write.js'),
  ...require('./thoughtStreams/query.js'),
  ...require('./thoughtStreams/reactions.js')
};
