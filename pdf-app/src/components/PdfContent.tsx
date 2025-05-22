import { Input } from 'antd';
import _ from 'lodash';
import React, { useMemo, useState } from 'react';

import { IPdfDataToStore, usePdfActions, usePdfData, useShowPdfPreview } from '../store/PdfStore';

const PdfContent: React.FC = () => {
	const showPdfPreview = useShowPdfPreview();
	const pdfData = usePdfData();
	const { setPdfData } = usePdfActions();

	const [subtitle, setSubtitle] = useState<string>(pdfData?.subtitle ?? '');
	const [description, setDescription] = useState<string>(pdfData?.description ?? '');

	const previewData = useMemo(() => {
		return {
			...pdfData,
			name: 'pdf-1',
			steps: _.map(pdfData?.steps ?? [], (step, index) => ({ ...step, index: index + 1 })),
			createdAt: new Date().toISOString(),
		} as IPdfDataToStore;
	}, [pdfData]);

	const debouncedHandleValuesChange = _.debounce((field: keyof IPdfDataToStore, value: any) => {
		setPdfData({
			...(pdfData as IPdfDataToStore),
			[field]: value,
		});
	}, 500);

	return (
		<div className={'h-[calc(100vh-106px)] bg-[#F1F6FB] overflow-y-scroll pb-20 pt-7'} id='pdf-view-wrapper'>
			{showPdfPreview ? (
				<div className='min-h-full w-full px-6'>
					<PdfLivePreview previewData={previewData} />
				</div>
			) : (
				<div className='min-h-full px-6 pr-3 flex flex-col gap-6'>
					<div className='pl-10'>
						<div className='bg-[#fff] p-4 pr-6 pb-8 rounded-lg space-y-8'>
							<Input.TextArea
								showCount
								rows={1}
								maxLength={150}
								placeholder='Add Overview (Optional)'
								value={subtitle}
								onBlur={() => debouncedHandleValuesChange('subtitle', subtitle)}
								onChange={(e) => setSubtitle(e.target.value)}
							/>
							<Input.TextArea
								showCount
								rows={2}
								maxLength={500}
								className='bg-white'
								placeholder='Description (Optional)'
								value={description}
								onBlur={() => debouncedHandleValuesChange('description', description)}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>
					</div>
					<StepsContainer setOpenImageUploader={setOpenImageUploader} />
				</div>
			)}
		</div>
	);
};

export default PdfContent;
