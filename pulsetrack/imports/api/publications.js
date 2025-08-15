import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Feedback } from './feedback';

Meteor.publish('feedback.all', function ({ limit = 50, channel, since } = {}) {
	const query = {};
	if (channel && ['web', 'mobile', 'branch'].includes(channel)) {
		query.channel = channel;
	}
	if (since instanceof Date) {
		query.createdAt = { $gte: since };
	}
	return Feedback.find(query, { sort: { createdAt: -1 }, limit });
});

// Live metrics: publish a single document in a synthetic collection 'metrics'
Meteor.publish('metrics.live', function () {
	const self = this;
	const collectionName = 'metrics';
	const docId = 'live';

	function computeAndSend() {
		const all = Feedback.find({}, { fields: { csat: 1, nps: 1, ces: 1, sentiment: 1 } }).fetch();
		const total = all.length || 1;
		const csat = all.reduce((s, d) => s + (d.csat || 0), 0) / total;
		const nps = all.reduce((s, d) => s + (d.nps || 0), 0) / total;
		const ces = all.reduce((s, d) => s + (d.ces || 0), 0) / total;
		const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };
		all.forEach((d) => {
			if (sentiments[d.sentiment] !== undefined) sentiments[d.sentiment] += 1;
		});

		const payload = { csat, nps, ces, sentiments };
		self.changed(collectionName, docId, payload);
	}

	self.added('metrics', 'live', { csat: 0, nps: 0, ces: 0, sentiments: { Positive: 0, Neutral: 0, Negative: 0 } });
	self.ready();

	const handle = Feedback.find().observeChanges({
		added: computeAndSend,
		changed: computeAndSend,
		removed: computeAndSend,
	});

	// Send initial metrics
	computeAndSend();

	self.onStop(() => handle.stop());
});