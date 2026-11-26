// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives simple writing its name; Awtsmoos.com keeps hidden advanced settings out of quick publication. */
import {creatorMetadataValue} from '../state/CreatorMetadataValue.js';
export function hasPostContent(snapshot) {
	return Boolean(snapshot.rootBlocks.some(block=>String(block.text || '').trim()) || snapshot.rootAttachments.length || snapshot.sections.length);
}
export function suggestedTitle(snapshot) {
	const text=snapshot.rootBlocks.map(block=>String(block.text || '').trim()).find(Boolean);
	const firstLine=text?.split(/\r?\n/).find(line=>line.trim());
	const filename=snapshot.rootAttachments.find(item=>item.name)?.name;
	return String(firstLine || filename?.replace(/\.[^.]+$/,'') || 'New post').trim().slice(0,120);
}
export function requiresAdvanced(snapshot) {
	const metadata=creatorMetadataValue(snapshot.creatorMetadata);
	return Boolean(snapshot.rootBlocks.length!==1 || snapshot.rootBlocks[0]?.type!=='paragraph' || snapshot.sections.length || snapshot.secondaryDestinations.length || snapshot.canonicalSource || snapshot.cloneSource || snapshot.questionId || snapshot.postKind!=='post' || snapshot.publication?.scheduledAt || JSON.stringify(metadata)!==JSON.stringify(creatorMetadataValue()));
}
