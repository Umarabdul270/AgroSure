# PulseTrack (Meteor 2.x)

Real-time customer sentiment tracking for digital banks. Built with Meteor 2.x, React, MongoDB, and Tailwind CSS.

## Prerequisites
- Node 14/16 compatible with Meteor 2.x
- MongoDB (bundled with Meteor for dev)

## Setup
```bash
curl https://install.meteor.com/ | sh
cd pulsetrack
meteor npm install
```

## Run
```bash
meteor run
```

Open `http://localhost:3000`.
- Feedback form: `/feedback`
- Dashboard: `/dashboard`

## Tech
- Meteor 2.13 (DDP pub/sub)
- React 18, react-meteor-data
- Tailwind CSS (PostCSS integration)
- Chart.js + react-chartjs-2

## Demo Data
Server seeds sample customers and feedback on first run. Use the "Mock Feedback Trigger" button on the dashboard to generate live events.