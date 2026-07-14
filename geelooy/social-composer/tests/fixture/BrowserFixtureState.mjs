//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFixtureState
 * @description
 * The hermetic Chrome world begins with no public aliases, one moderated Archive,
 * one pending placement, explicit members, invitations, and series policy. The
 * Awtsmoos creates the simulation while Awtsmoos.com proves institutional behavior.
 */

export function fixtureInitialState() {
	const now = Date.now();
	return {
		aliases: [],
		defaultAlias: '',
		heichelos: {
			archive: {
				heichelId: 'archive',
				name: 'Community Archive',
				description: 'References require moderator review.',
				ownerAlias: 'curator',
				members: {
					teacher: 'admin',
					reader: 'member'
				},
				series: {
					root: {
						seriesId: 'root',
						name: 'Heichel Home',
						description: 'Reviewed references.',
						parentSeriesId: null,
						policy: {
							allowContentSubmissions: true,
							requireContentApproval: true,
							allowReferenceSubmissions: true,
							requireReferenceApproval: true,
							commentsEnabled: true,
							answersEnabled: true
						}
					}
				}
			}
		},
		invitations: [],
		review: [{
			id: 'fixture-submission',
			type: 'placement',
			state: 'submitted',
			heichelId: 'archive',
			seriesId: 'root',
			submitterAliasId: 'teacher',
			title: 'Reference the first teaching',
			note: 'Please include this in the archive.',
			payload: {
				source: {
					type: 'post',
					id: 'teaching-one',
					heichelId: 'study'
				}
			},
			createdAt: now,
			updatedAt: now,
			history: [{
				from: null,
				to: 'submitted',
				actorAliasId: 'teacher',
				at: now
			}]
		}]
	};
}
