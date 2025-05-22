import { Col, Row } from 'antd';
import React from 'react';

import PdfSteps from './PdfSteps';
import PdfContent from './PdfContent';

const PdfContentWrapper: React.FC = () => {
	return (
		<Row className={'h-[calc(100vh-106px)]'}>
			<Col span={6} className='h-full'>
				<PdfSteps />
			</Col>
			<Col span={18}>
				<PdfContent />
			</Col>
		</Row>
	);
};

export default PdfContentWrapper;
