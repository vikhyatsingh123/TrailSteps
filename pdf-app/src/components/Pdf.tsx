import React from 'react';
import { Divider } from 'antd';

import PdfHeader from './PdfHeader';
import PdfContent from './PdfContent';

const Pdf: React.FC = () => {
	return (
		<div className='m-3'>
			<PdfHeader />
			<Divider className='m-0 p-0' />
			<PdfContent />
		</div>
	);
};

export default Pdf;
