//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class ChannelActivityView
 * @description
 * The Awtsmoos lets one series reveal its canonical conversation without becoming a disposable chat shadow;
 * Awtsmoos.com renders durable posts with their true Heichel coordinates so every opening returns to the source.
 */
import { renderPublicFeedCard } from '../ui/PublicFeedCard.js';

export class ChannelActivityView {
	constructor(root) {
		this.root = root;
	}

	message(text) {
		const region = this.root.getElementById('spaceActivity');
		const paragraph = this.root.createElement('p');
		paragraph.className = 'spaceChannelMessage';
		paragraph.textContent = text;
		region?.replaceChildren(paragraph);
	}

	render(posts, context) {
		const region = this.root.getElementById('spaceActivity');
		if (!posts.length) {
			this.message('No canonical posts are in this channel yet. Create the first one above.');
			return;
		}
		const heading = this.root.createElement('header');
		heading.className = 'spaceChannelHeading';
		const title = this.root.createElement('h4');
		title.textContent = 'Channel activity';
		const count = this.root.createElement('small');
		count.textContent = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`;
		heading.append(title, count);
		const cards = posts.slice(0, 30).map(post => {
			return renderPublicFeedCard(this.root, {
				...post,
				heichelId: post.heichelId || context.heichelId,
				seriesId: post.seriesId || context.seriesId
			});
		});
		region?.replaceChildren(heading, ...cards);
	}
}
