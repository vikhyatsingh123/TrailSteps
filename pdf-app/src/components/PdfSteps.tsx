import React, { useEffect, useMemo } from 'react';
import { Steps } from 'antd';
import _ from 'lodash';
import clsx from 'clsx';

import EmptySteps from './EmptySteps';
import { usePdfData, useCurrentStep, usePdfActions } from '../store/PdfStore';

const PdfSteps: React.FC = () => {
	const pdfData = usePdfData();
	const currentStep = useCurrentStep();
	const { setCurrentStep } = usePdfActions();

	const pdfSteps = pdfData?.steps ?? [];

	const items = useMemo(() => {
		return _.map(pdfSteps, (ele, index) => {
			const stepId = ele?.id ?? '';
			const stepTitle = ele?.title ?? '';
			return {
				key: stepId,
				title: (
					<span
						className={clsx(
							'text-[14px] font-normal leading-[22px] line-clamp-1 mt-[6px]',
							currentStep === index ? 'text-black/85' : 'text-gray-400',
						)}
					>
						{stepTitle}
					</span>
				),
			};
		});
	}, [pdfSteps, currentStep]);

	useEffect(() => {
		if (_.isEmpty(pdfData?.steps)) {
			return;
		}
		const container = document.querySelector('#pdf-view-wrapper');
		if (!container) {
			return;
		}

		const handleScroll = () => {
			const stepElements = pdfSteps.map((step) => document.getElementById(`pdf-step-${step.id}`)).filter(Boolean);

			const containerRect = container.getBoundingClientRect();
			const containerTop = containerRect.top;
			const containerHeight = containerRect.height;

			for (let i = 0; i < stepElements.length; i++) {
				const element = stepElements[i];
				if (!element) {
					continue;
				}

				const rect = element.getBoundingClientRect();
				const elementTop = rect.top - containerTop;
				const elementHeight = rect.height;

				if (elementTop <= containerHeight * 0.5 && elementTop + elementHeight >= containerHeight * 0.5) {
					setCurrentStep(i);
					break;
				}
			}
		};

		container.addEventListener('scroll', handleScroll);

		return () => {
			container.removeEventListener('scroll', handleScroll);
		};
	}, [pdfSteps, setCurrentStep]);

	const scrollToStep = (stepId: string) => {
		const element = document.getElementById(`pdf-step-${stepId}`);
		element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const onChange = (value: number) => {
		const stepId = pdfSteps[value]?.id ?? '';
		setCurrentStep(value);
		scrollToStep(stepId);
	};

	const isAllStepTitleEmpty = _.every(pdfSteps, (step) => _.get(step, 'title') === '');

	return (
		<div className='h-full p-6 overflow-x-hidden overflow-y-scroll relative'>
			{isAllStepTitleEmpty ? (
				<EmptySteps />
			) : (
				<Steps
					items={items}
					initial={0}
					current={currentStep}
					progressDot
					direction='vertical'
					onChange={onChange}
				/>
			)}
		</div>
	);
};

export default PdfSteps;
