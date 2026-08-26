//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file InteractionComposerTemplate.js
 * @description Keeps the ordinary social act beautifully small while voice, media, and promotion remain nearby but retractable.
 * The Awtsmoos lets one sentence carry infinite relation; Awtsmoos.com gives Tiferes the clear composer first,
 * while richer media and transformation vessels unfold only when the user's intention calls their hidden light.
 */

/**
 * Reveals the primary rich-comment composer with optional media tools in a native disclosure.
 * @returns {string} Composer markup preserving all historic controller identifiers.
 */
export function revealTiferesCommentComposer() {
	return `
		<div class="commentComposer riftCard socialPrimaryComposer">
			<label>
				<span class="fieldLabelText">Comment</span>
				<textarea id="commentContent" placeholder="Write the response that belongs here."></textarea>
			</label>
			<details class="socialAdvancedVessel">
				<summary class="socialAdvancedSummary"><strong>Voice & media</strong><span>Transcript · mood · attachments</span></summary>
				<div class="twoColumnFields">
					<label><span class="fieldLabelText">Voice transcript</span><textarea id="commentTranscript" placeholder="Optional transcript for a voice note"></textarea></label>
					<label><span class="fieldLabelText">Mood</span><input id="commentMood" placeholder="questioning, grateful, urgent…"></label>
				</div>
				<div class="mediaActions">
					<label class="fileButton"><span>Attach image, voice, or video</span><input id="commentFiles" type="file" accept="image/*,audio/*,video/*" multiple></label>
					<button id="uploadCommentMedia" type="button">Upload media</button>
					<button id="copyTargetLink" type="button">Copy exact target</button>
				</div>
				<div id="commentMediaQueue" class="commentMediaQueue"></div>
			</details>
		</div>`;
}

/**
 * Reveals comment-to-post promotion as a deliberately advanced transformation vessel.
 * @returns {string} Promotion markup preserving all historic controller identifiers.
 */
export function revealGevurahPromotionVessel() {
	return `
		<details id="promotionPanel" class="promotionPanel riftCard socialAdvancedVessel">
			<summary class="socialAdvancedSummary"><strong>Promote comment to post</strong><span>Preserve thread provenance</span></summary>
			<div class="targetGrid">
				<label><span class="fieldLabelText">Comment ID</span><input id="promotionCommentId"></label>
				<label><span class="fieldLabelText">Destination Heichel</span><input id="promotionHeichelId"></label>
				<label><span class="fieldLabelText">Destination series</span><input id="promotionSeriesId" value="root"></label>
				<label><span class="fieldLabelText">Visibility</span><select id="promotionVisibility"><option value="public">Public</option><option value="unlisted">Unlisted</option><option value="private">Private</option></select></label>
			</div>
			<label><span class="fieldLabelText">Post title</span><input id="promotionTitle"></label>
			<label><span class="fieldLabelText">Post summary</span><textarea id="promotionSummary"></textarea></label>
			<div class="actionRow">
				<button id="promotionPreview" type="button">Preview provenance</button>
				<button id="promotionPublish" type="button" class="primaryButton" disabled>Publish new canonical post</button>
			</div>
			<pre id="promotionResult"></pre>
		</details>`;
}
