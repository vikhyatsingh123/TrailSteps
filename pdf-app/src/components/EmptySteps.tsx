import { Empty, Result } from 'antd';
import React from 'react';

const EmptySteps: React.FC = () => {
	return (
		<div className='h-full w-full flex items-center justify-center'>
			<Result
				icon={<Empty />}
				title={
					<div className='text-[rgba(0,0,0,0.85)] text-[16px] font-bold leading-[24px] text-center mt-4'>
						Your Steps Show Up Here!
					</div>
				}
				subTitle={
					<div className='text-[rgba(0,0,0,0.85)] text-center text-sm font-normal leading-[22px] mt-2'>
						Once you add your steps, they’ll guide you <br />
						through the pdf.
					</div>
				}
			/>
		</div>
	);
};

export default EmptySteps;
