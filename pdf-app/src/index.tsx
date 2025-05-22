import React from 'react';
import ReactDOM from 'react-dom/client';

import './styles/index.css';
import Pdf from './components/Pdf';

const App: React.FC = () => {
	return <Pdf />;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
