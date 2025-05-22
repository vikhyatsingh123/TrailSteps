import React from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
	return (
		<div>
			<h1>Hello PDF App</h1>
		</div>
	);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
