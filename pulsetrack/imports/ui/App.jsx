import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import FeedbackPage from './pages/FeedbackPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export const App = () => (
	<div className="min-h-screen bg-gray-50">
		<BrowserRouter>
			<header className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
					<Link to="/" className="font-semibold">PulseTrack</Link>
					<nav className="flex gap-4 text-sm">
						<Link to="/feedback" className="hover:underline">Feedback</Link>
						<Link to="/dashboard" className="hover:underline">Dashboard</Link>
					</nav>
				</div>
			</header>
			<main className="py-6">
				<Routes>
					<Route path="/" element={<Navigate to="/feedback" replace />} />
					<Route path="/feedback" element={<FeedbackPage />} />
					<Route path="/dashboard" element={<DashboardPage />} />
				</Routes>
			</main>
		</BrowserRouter>
	</div>
);
