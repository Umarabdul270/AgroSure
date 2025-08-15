import React, { useMemo, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useFind, useTracker } from 'meteor/react-meteor-data';
import { Feedback } from '/imports/api/feedback';
import { Metrics } from '/imports/api/metrics.client';
import MockTrigger from '/imports/ui/components/MockTrigger.jsx';
import dayjs from 'dayjs';
import { Pie, Line } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function DashboardPage() {
	const [channel, setChannel] = useState('');
	const [days, setDays] = useState(7);

	const since = useMemo(() => new Date(Date.now() - days * 24 * 3600 * 1000), [days]);
	const isFeedbackSub = useSubscribe('feedback.all', { limit: 100, channel: channel || undefined, since });
	const isMetricsSub = useSubscribe('metrics.live');

	const feedbacks = useFind(
		() => Feedback.find({}, { sort: { createdAt: -1 }, limit: 100 }),
		[channel, since]
	);

	const metrics = useTracker(() => {
		const doc = Metrics.findOne('live');
		return doc || { csat: 0, nps: 0, ces: 0, sentiments: { Positive: 0, Neutral: 0, Negative: 0 } };
	}, []);

	const pieData = useMemo(() => ({
		labels: ['Positive', 'Neutral', 'Negative'],
		datasets: [
			{
				data: [metrics.sentiments.Positive, metrics.sentiments.Neutral, metrics.sentiments.Negative],
				backgroundColor: ['#16a34a', '#94a3b8', '#ef4444'],
			},
		],
	}), [metrics]);

	const trendData = useMemo(() => {
		const byDay = {};
		feedbacks.forEach((f) => {
			const k = dayjs(f.createdAt).format('YYYY-MM-DD');
			if (!byDay[k]) byDay[k] = { csat: [], nps: [], ces: [] };
			byDay[k].csat.push(f.csat);
			byDay[k].nps.push(f.nps);
			byDay[k].ces.push(f.ces);
		});
		const labels = Object.keys(byDay).sort();
		return {
			labels,
			datasets: [
				{ label: 'CSAT', data: labels.map((d) => avg(byDay[d].csat)), borderColor: '#3b82f6' },
				{ label: 'NPS', data: labels.map((d) => avg(byDay[d].nps)), borderColor: '#22c55e' },
				{ label: 'CES', data: labels.map((d) => avg(byDay[d].ces)), borderColor: '#f59e0b' },
			],
		};
	}, [feedbacks]);

	const hasNegative = feedbacks.some((f) => f.sentiment === 'Negative');

	return (
		<div className="max-w-7xl mx-auto p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">PulseTrack Dashboard</h1>
				<div className="flex items-center gap-3">
					<MockTrigger />
					<select value={channel} onChange={(e) => setChannel(e.target.value)} className="border rounded px-3 py-2">
						<option value="">All Channels</option>
						<option value="web">Web</option>
						<option value="mobile">Mobile</option>
						<option value="branch">Branch</option>
					</select>
					<select value={days} onChange={(e) => setDays(+e.target.value)} className="border rounded px-3 py-2">
						<option value={1}>1 day</option>
						<option value={7}>7 days</option>
						<option value={30}>30 days</option>
					</select>
				</div>
			</div>

			{hasNegative && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
					Immediate Attention: Negative feedback received.
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="rounded border p-4"><Metric title="CSAT" value={metrics.csat} /></div>
				<div className="rounded border p-4"><Metric title="NPS" value={metrics.nps} /></div>
				<div className="rounded border p-4"><Metric title="CES" value={metrics.ces} /></div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="rounded border p-4">
					<h3 className="font-medium mb-2">Sentiment Breakdown</h3>
					<Pie data={pieData} />
				</div>
				<div className="rounded border p-4">
					<h3 className="font-medium mb-2">Score Trends</h3>
					<Line data={trendData} />
				</div>
			</div>

			<div className="rounded border p-4">
				<h3 className="font-medium mb-2">Recent Feedback</h3>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left border-b">
								<th className="py-2 px-2">When</th>
								<th className="py-2 px-2">Channel</th>
								<th className="py-2 px-2">CSAT</th>
								<th className="py-2 px-2">NPS</th>
								<th className="py-2 px-2">CES</th>
								<th className="py-2 px-2">Sentiment</th>
								<th className="py-2 px-2">Comment</th>
							</tr>
						</thead>
						<tbody>
							{feedbacks.map((f) => (
								<tr key={f._id} className="border-b last:border-0">
									<td className="py-2 px-2 whitespace-nowrap">{dayjs(f.createdAt).format('MMM D, HH:mm')}</td>
									<td className="py-2 px-2">{f.channel}</td>
									<td className="py-2 px-2">{f.csat}</td>
									<td className="py-2 px-2">{f.nps}</td>
									<td className="py-2 px-2">{f.ces}</td>
									<td className="py-2 px-2">{f.sentiment}</td>
									<td className="py-2 px-2 max-w-xl truncate" title={f.comment}>{f.comment}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function Metric({ title, value }) {
	return (
		<div>
			<div className="text-gray-500 text-sm">{title}</div>
			<div className="text-3xl font-semibold">{Number(value || 0).toFixed(2)}</div>
		</div>
	);
}

function avg(arr) {
	if (!arr.length) return 0;
	return arr.reduce((s, v) => s + v, 0) / arr.length;
}