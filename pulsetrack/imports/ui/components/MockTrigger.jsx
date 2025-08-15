import React from 'react';
import { Meteor } from 'meteor/meteor';

export default function MockTrigger() {
	function randomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	function trigger() {
		const channels = ['web', 'mobile', 'branch'];
		const channel = channels[randomInt(0, channels.length - 1)];
		const payload = {
			customerId: 'demo-' + randomInt(1, 9999),
			channel,
			csat: randomInt(1, 5),
			nps: randomInt(0, 10),
			ces: randomInt(1, 5),
			comment: Math.random() < 0.3 ? 'Terrible experience, app crashed' : Math.random() < 0.6 ? 'Okay' : 'Loved it!',
		};
		Meteor.call('feedback.insert', payload);
	}
	return (
		<button onClick={trigger} className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Mock Feedback Trigger</button>
	);
}