import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import clsx from 'clsx';

export default function FeedbackPage() {
	const [form, setForm] = useState({
		customerId: 'demo-123',
		channel: 'web',
		csat: 3,
		nps: 5,
		ces: 3,
		comment: '',
	});
	const [status, setStatus] = useState(null);

	function handleChange(e) {
		const { name, value } = e.target;
		setForm((s) => ({ ...s, [name]: name === 'comment' ? value : Number.isNaN(+value) ? value : +value }));
	}

	function handleSubmit(e) {
		e.preventDefault();
		setStatus('Submitting...');
		Meteor.call('feedback.insert', form, (err) => {
			if (err) {
				setStatus(err.reason || 'Submission failed');
			} else {
				setStatus('Thanks for your feedback!');
				setForm((s) => ({ ...s, comment: '' }));
			}
		});
	}

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-2xl font-semibold mb-4">Share your experience</h1>
			<form onSubmit={handleSubmit} className="space-y-4 bg-white/60 rounded-lg p-4 shadow">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<label className="block">
						<span className="text-sm text-gray-600">Channel</span>
						<select name="channel" value={form.channel} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2">
							<option value="web">Web</option>
							<option value="mobile">Mobile</option>
							<option value="branch">Branch</option>
						</select>
					</label>
					<label className="block">
						<span className="text-sm text-gray-600">Customer ID</span>
						<input name="customerId" value={form.customerId} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
					</label>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<label className="block">
						<span className="text-sm text-gray-600">CSAT (1-5)</span>
						<input type="number" name="csat" min={1} max={5} value={form.csat} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
					</label>
					<label className="block">
						<span className="text-sm text-gray-600">NPS (0-10)</span>
						<input type="number" name="nps" min={0} max={10} value={form.nps} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
					</label>
					<label className="block">
						<span className="text-sm text-gray-600">CES (1-5)</span>
						<input type="number" name="ces" min={1} max={5} value={form.ces} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
					</label>
				</div>
				<label className="block">
					<span className="text-sm text-gray-600">Comment</span>
					<textarea name="comment" value={form.comment} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" rows={4} placeholder="Tell us what happened..." />
				</label>
				<div className="flex items-center justify-between">
					<button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Submit</button>
					{status && <span className="text-sm text-gray-700">{status}</span>}
				</div>
			</form>
		</div>
	);
}