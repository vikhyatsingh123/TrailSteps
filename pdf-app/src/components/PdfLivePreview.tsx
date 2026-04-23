import React, { useState } from 'react';

import GetFooterTemplateWise from '@admin-vite/components/Tipsheet/tipsheet-previews/GetFooterTemplateWise';
import GetHeaderTemplateWise from '@admin-vite/components/Tipsheet/tipsheet-previews/GetHeaderTemplateWise';
import GetPreviewTemplateWise from '@admin-vite/components/Tipsheet/tipsheet-previews/GetPreviewTemplateWise';
import TipsheetDescription from '@admin-vite/components/Tipsheet/tipsheet-previews/TipsheetDescription';
import logo from '@admin-vite/assets/logo.png';
import { IPdfDataToStore } from '../store/PdfStore';

interface IProps {
	previewData: IPdfDataToStore;
}

const TipsheetLivePreview: React.FC<IProps> = (props) => {
	const { previewData } = props;

	const [imgSrc, setImgSrc] = useState(window.LOGO);

	const handleError = () => {
		setImgSrc(logo);
	};

	return (
		<div id='tipsheet-view-container' className={'bg-[#fff] rounded-2xl overflow-auto h-full p-4 pb-0'}>
			<div className='py-6 px-[40px]'>
				<GetHeaderTemplateWise data={previewData} imgSrc={imgSrc} onError={handleError} />
				<TipsheetDescription data={previewData} />
				<GetPreviewTemplateWise data={previewData} minHeight='calc(100vh - 20px)' />
			</div>
			<GetFooterTemplateWise imgSrc={imgSrc} footer={footer} onError={handleError} />
		</div>
	);
};

export default TipsheetLivePreview;
