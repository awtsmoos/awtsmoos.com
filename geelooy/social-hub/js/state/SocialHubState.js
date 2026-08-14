//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SocialHubState
 * @description
 * The Awtsmoos gathers public identity, people discovery, navigation, profile evidence, and interaction context
 * into one observable vessel while Awtsmoos.com lets each chamber reveal only the state it truly owns.
 */

const TABS = Object.freeze([
	'home',
	'people',
	'interact',
	'activity',
	'profile',
	'network',
	'references',
	'privacy'
]);

function contextFromLocation(location = window.location) {
	const query = new URLSearchParams(location.search);
	const hash = location.hash.replace(/^#/, '');
	return {
		aliasId: String(query.get('alias') || ''),
		profileAliasId: String(query.get('profile') || query.get('alias') || ''),
		activeTab: TABS.includes(hash) ? hash : 'home',
		heichelId: String(query.get('heichel') || ''),
		seriesId: String(query.get('series') || 'root'),
		entityType: String(query.get('type') || 'post'),
		entityId: String(query.get('entity') || query.get('post') || ''),
		verseSection: String(query.get('verse') || 'root'),
		subsectionId: String(query.get('subsection') || ''),
		parentCommentId: String(query.get('reply') || '')
	};
}

function initialValue(context = contextFromLocation()) {
	return {
		context,
		identity: {
			loggedIn: false,
			aliases: [],
			aliasId: context.aliasId
		},
		activeTab: context.activeTab,
		profileAliasId: context.profileAliasId,
		profile: null,
		activity: [],
		preferences: null,
		comment: {
			content: '',
			audioNoteText: '',
			mood: '',
			assets: [],
			references: [],
			target: {
				heichelId: context.heichelId,
				seriesId: context.seriesId,
				entityType: context.entityType,
				entityId: context.entityId,
				verseSection: context.verseSection,
				subsectionId: context.subsectionId,
				parentCommentId: context.parentCommentId,
				parentSectionId: ''
			}
		},
		busy: false,
		status: ''
	};
}

export class SocialHubState extends EventTarget {
	constructor(context = contextFromLocation()) {
		super();
		this.value = initialValue(context);
	}

	snapshot() {
		return structuredClone(this.value);
	}

	mutate(reason, change) {
		change(this.value);
		this.dispatchEvent(new CustomEvent('change', {
			detail: { reason, snapshot: this.snapshot() }
		}));
	}

	set(field, value) {
		this.mutate(`set:${field}`, state => {
			state[field] = value;
		});
	}

	setComment(field, value) {
		this.mutate(`comment:${field}`, state => {
			state.comment[field] = value;
		});
	}

	setTarget(field, value) {
		this.mutate(`target:${field}`, state => {
			state.comment.target[field] = value;
		});
	}
}

export {
	TABS,
	contextFromLocation,
	initialValue
};
