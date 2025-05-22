import { Col, Row } from 'antd';
import React from 'react';

import PdfSteps from './PdfSteps';

const PdfContent: React.FC = () => {
	return (
		<Row>
			<Col span={6}>
				<PdfSteps />
			</Col>
			<Col span={18}></Col>
		</Row>
	);
};

export default PdfContent;
