import { Button, Input, Tooltip, Typography } from 'antd';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { Copy, Delete, Drag } from '@icon-park/react';
import { LexicalEditor } from 'lexical';
import { useSortable } from '@dnd-kit/sortable';

import Editor from '@admin-vite/components/lexical-editor/Editor';
import StepImageWithTooltipAndNotes from './StepImageWithTooltipAndNotes';
import {
	ITipsheetDataToStore,
	ITipsheetStep,
} from '@admin-vite/features/tip-sheet-asset-selection/store/tipSheetStore';
import { getFormattedInitialString } from '../utils/utils';

interface IProps {
	step: ITipsheetStep;
	index: number;
	onDuplicate: (index: number) => void;
	onDelete: (id: string) => void;
	onTitleChange: (id: string, value: string) => void;
	onTitleBlur: (id: string, value: string) => void;
	onDescriptionChange: (index: number, value: string) => void;
	invalidStepIds: Set<string>;
	editor: LexicalEditor;
	setEditor: React.Dispatch<React.SetStateAction<LexicalEditor>>;
	isTarget: boolean;
	handleStepDrop: (e: any) => void;
	handleStepDragOver: (e: any) => void;
	setOpenImageUploader: (open: boolean) => void;
	stepMetaHandlers: {
		handleAddAlert: (i: number) => void;
		handleAddTips: (i: number) => void;
		handleAddLink: (i: number) => void;
		debouncedSetTipSheetData: (tipSheetData: ITipsheetDataToStore) => void;
	};
}

const SortableStepItem: React.FC<IProps> = (props) => {
	const {
		step,
		index,
		onDuplicate,
		onDelete,
		onTitleChange,
		onTitleBlur,
		onDescriptionChange,
		invalidStepIds,
		editor,
		setEditor,
		isTarget,
		handleStepDrop,
		handleStepDragOver,
		setOpenImageUploader,
		stepMetaHandlers,
	} = props;
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		borderColor: isTarget ? '#0386b5' : 'transparent',
		boxShadow: isTarget ? '0 0 0 1.5px #0386b5 inset' : 'none',
	};

	return (
		<button
			ref={setNodeRef}
			{...attributes}
			style={style}
			onDragOver={handleStepDragOver}
			onDrop={handleStepDrop}
			tabIndex={0}
			className='bg-transparent !p-0 border-none'
			id={`tipsheet-step-${step.id}`}
		>
			<div className='flex'>
				<Button type='link' size='large' icon={<Drag fill='black' />} {...listeners} className='mt-5' />
				<div className='grow p-6 pb-0 w-full rounded-lg transition ease-in-out duration-200 bg-white'>
					<div className='flex items-center justify-between mb-4'>
						<Typography.Title level={4} className='!text-base !font-medium !leading-6 m-0'>
							Step {index + 1}
						</Typography.Title>
						<div className='flex items-center gap-0'>
							<Tooltip title='Duplicate'>
								<Button type='text' icon={<Copy size={17} />} onClick={() => onDuplicate(index)} />
							</Tooltip>
							<Tooltip title='Delete'>
								<Button
									type='text'
									icon={<Delete fill='#262626' />}
									onClick={() => onDelete(step.id)}
								/>
							</Tooltip>
						</div>
					</div>

					<div className='flex flex-col gap-y-2 text-left'>
						<span className='text-[#434343] text-[14px]'>Title</span>
						<Input
							placeholder='Enter title here.'
							defaultValue={step.title}
							status={invalidStepIds.has(step.id) ? 'error' : ''}
							onBlur={(e) => onTitleBlur(step.id, e.target.value)}
							onChange={(e) => onTitleChange(step.id, e.target.value)}
						/>
					</div>

					<div className='my-4 flex flex-col gap-y-2 text-left'>
						<span className='text-[#434343] text-[14px]'>Content</span>
						<Editor
							key={step.id}
							activeFocus
							showViewMore
							editor={editor}
							placeholder='Start typing here'
							value={getFormattedInitialString(step?.description)}
							activeFormField='content'
							setEditor={setEditor}
							onChange={(val) => onDescriptionChange(index, val)}
							tollsLeftAligned
						/>
					</div>
					<StepImageWithTooltipAndNotes
						step={step}
						setOpenImageUploader={setOpenImageUploader}
						onHandleAddAlert={stepMetaHandlers.handleAddAlert}
						onHandleAddTips={stepMetaHandlers.handleAddTips}
						onHandleAddLink={stepMetaHandlers.handleAddLink}
						index={index}
						debouncedSetTipSheetData={stepMetaHandlers.debouncedSetTipSheetData}
					/>
				</div>
			</div>
		</button>
	);
};

export default SortableStepItem;
