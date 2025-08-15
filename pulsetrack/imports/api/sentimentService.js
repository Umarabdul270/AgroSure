export function analyzeSentiment(comment) {
	const sentiments = ['Positive', 'Neutral', 'Negative'];
	const index = Math.floor(Math.random() * sentiments.length);
	return sentiments[index];
}