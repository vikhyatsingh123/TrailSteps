import React from 'react';
import { Button } from 'antd';
import { Download, Eyes } from '@icon-park/react';

const PdfHeader: React.FC = () => {
	return (
		<div className='flex items-center justify-between mb-2'>
			<div className='text-2xl font-bold'>TrailSteps</div>
			<div className='flex items-center gap-2'>
				<Button icon={<Eyes />} type='link'>
					Preview
				</Button>
				<Button icon={<Download />} type='primary'>
					Download
				</Button>
			</div>
		</div>
	);
};
export default PdfHeader;
