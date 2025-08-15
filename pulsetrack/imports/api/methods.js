import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Feedback } from './feedback';
import { analyzeSentiment } from './sentimentService';

Meteor.methods({
	'feedback.insert'(payload) {
		check(payload, {
			customerId: String,
			channel: Match.OneOf('web', 'mobile', 'branch'),
			csat: Match.Where((v) => typeof v === 'number' && v >= 1 && v <= 5),
			nps: Match.Where((v) => typeof v === 'number' && v >= 0 && v <= 10),
			ces: Match.Where((v) => typeof v === 'number' && v >= 1 && v <= 5),
			comment: String,
		});

		const sentiment = analyzeSentiment(payload.comment || '');
		const doc = {
			customerId: payload.customerId,
			channel: payload.channel,
			csat: payload.csat,
			nps: payload.nps,
			ces: payload.ces,
			comment: payload.comment,
			sentiment,
			createdAt: new Date(),
		};

		const _id = Feedback.insert(doc);

		if (sentiment === 'Negative') {
			// For demo: set a flag in a server-side ephemeral store or log
			console.warn('[ALERT] Negative feedback received:', _id);
		}

		return _id;
	},
});