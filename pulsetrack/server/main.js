import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Feedback, Customers } from '/imports/api/feedback';
import '/imports/api/methods';
import '/imports/api/publications';

function seedCustomers() {
	if (Customers.find().count() > 0) return;
	const sample = [
		{ name: 'Alice Johnson', contact: 'alice@example.com', segment: 'Retail' },
		{ name: 'Bob Singh', contact: 'bob@example.com', segment: 'SME' },
		{ name: 'Carla Gomez', contact: 'carla@example.com', segment: 'Retail' },
	];
	sample.forEach((c) => Customers.insert({ ...c, createdAt: new Date() }));
}

function seedFeedback() {
	if (Feedback.find().count() > 0) return;
	const channels = ['web', 'mobile', 'branch'];
	const sentiments = ['Positive', 'Neutral', 'Negative'];
	const customers = Customers.find().fetch();
	for (let i = 0; i < 25; i += 1) {
		const cust = customers[i % customers.length];
		Feedback.insert({
			customerId: String(i + 1),
			channel: channels[i % channels.length],
			csat: 1 + (i % 5),
			nps: i % 11,
			ces: 1 + ((i + 2) % 5),
			comment: i % 4 === 0 ? 'App is slow after login' : i % 3 === 0 ? 'Great service!' : 'Okay experience',
			sentiment: sentiments[i % sentiments.length],
			createdAt: new Date(Date.now() - i * 3600 * 1000),
		});
	}
}

Meteor.startup(() => {
	seedCustomers();
	seedFeedback();
});
