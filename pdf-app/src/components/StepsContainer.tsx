import React, { useMemo, useState } from 'react';
import _ from 'lodash';
import { Button } from 'antd';
import { Plus } from '@icon-park/react';
import { LexicalEditor } from 'lexical';
import { RcFile } from 'antd/es/upload';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableStepItem from './SortableStepItem';
import { usePdfData, usePdfActions, IPdfStep } from '../store/PdfStore';

interface IProps {
	setOpenImageUploader: React.Dispatch<React.SetStateAction<boolean>>;
}

const StepsContainer: React.FC<IProps> = ({ setOpenImageUploader }) => {
	const pdfData = usePdfData();
	const { setPdfData } = usePdfActions();
	const [editor, setEditor] = useState<LexicalEditor>();

	const [targetIndex, setTargetIndex] = useState<number | null>(null);
	const [invalidStepIds, setInvalidStepIds] = useState<Set<string>>(new Set());

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const addFile = (file: File, fileKey: number) => {
		const id = `${crypto.randomUUID()}.${_.last(file.name.split('.'))}`;
		// @ts-expect-error - file.meta is not defined
		file.meta = { ...file.meta, imageId: id, fileKey };
		uppy?.addFile(file);
	};

	const handleChange = (files: RcFile[], index: number): boolean => {
		if (!files.length) {
			return false;
		}
		let processed = false;
		files.forEach((file) => {
			if (file) {
				addFile(file, index);
				processed = true;
			}
		});
		return processed;
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
		e.preventDefault();
		e.stopPropagation();
		const files = Array.from(e.dataTransfer.files);
		handleChange(files as RcFile[], index);
		setTargetIndex(null);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) {
			return;
		}
		const steps = [...(pdfData?.steps ?? [])];
		const oldIndex = steps.findIndex((s) => s.id === active.id);
		const newIndex = steps.findIndex((s) => s.id === over.id);
		if (oldIndex === -1 || newIndex === -1) {
			return;
		}
		const reordered = arrayMove(steps, oldIndex, newIndex);
		reordered.forEach((s, i) => (s.index = i));
		setPdfData({ ...pdfData, steps: reordered });
	};

	const handleAddStep = () => {
		const newStep: IPdfStep = {
			title: '',
			description: '',
			url: null,
			screenshot: null,
			id: crypto.randomUUID(),
			index: pdfData?.steps?.length ?? 0,
			notes: null,
			tooltip: null,
			stepImages: [],
			imageIds: [],
		};
		const isStepsDataPresent = pdfData?.steps?.every((step) => step.title);
		if (isStepsDataPresent) {
			setPdfData({ ...pdfData, steps: [...(pdfData?.steps ?? []), newStep] });
		}
	};

	const debouncedSetPdfData = useMemo(() => _.debounce((data) => setPdfData(data), 300), []);

	const handleTitleBlur = (stepId: string, value: string) => {
		if (!value.trim()) {
			setInvalidStepIds((prev) => new Set(prev.add(stepId)));
		} else {
			setInvalidStepIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(stepId);
				return newSet;
			});
		}
	};

	const isAddStepDisabled = useMemo(() => {
		const steps = pdfData?.steps ?? [];
		return steps.some((step) => !step.title?.trim());
	}, [pdfData?.steps]);

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<SortableContext items={(pdfData?.steps ?? []).map((s) => s.id)} strategy={verticalListSortingStrategy}>
				<div className='flex flex-col gap-4'>
					{(pdfData?.steps ?? []).map((step, index) => (
						<SortableStepItem
							key={step.id}
							step={step}
							index={index}
							onDuplicate={(i: number) => {
								const steps = [...(pdfData?.steps ?? [])];
								const newItem = {
									...steps[i],
									id: crypto.randomUUID(),
									imageIds: [],
									index: steps.length,
								};
								steps.splice(i + 1, 0, newItem);
								steps.forEach((s, i) => (s.index = i));
								setPdfData({ ...pdfData, steps });
							}}
							onDelete={(id: string) => {
								const steps = pdfData?.steps.filter((s) => s.id !== id) ?? [];
								if (steps.length === 0) {
									setPdfData({
										...pdfData,
										steps: [
											{
												title: '',
												description: '',
												url: null,
												screenshot: null,
												id: crypto.randomUUID(),
												index: 0,
												notes: null,
												tooltip: null,
												stepImages: [],
												imageIds: [],
												imageProperties: {},
											},
										],
									});
								} else {
									steps.forEach((s, i) => (s.index = i));
									setPdfData({ ...pdfData, steps });
								}
							}}
							onTitleChange={(id: string, val: string) => {
								const steps = [...(pdfData?.steps ?? [])];
								const idx = steps.findIndex((s) => s.id === id);
								if (idx !== -1) {
									steps[idx].title = val;
									setPdfData({ ...pdfData, steps });
								}
							}}
							onTitleBlur={handleTitleBlur}
							onDescriptionChange={(idx: number, val: string) => {
								const steps = [...(pdfData?.steps ?? [])];
								steps[idx].description = val;
								setPdfData({ ...pdfData, steps });
							}}
							invalidStepIds={invalidStepIds}
							editor={editor}
							setEditor={setEditor}
							isTarget={targetIndex === index}
							handleStepDrop={(e: any) => handleDrop(e, index)}
							handleStepDragOver={(e: any) => {
								handleDragOver(e);
								setTargetIndex(index);
							}}
							setOpenImageUploader={setOpenImageUploader}
							stepMetaHandlers={{
								handleAddAlert: (i: number) => {
									const steps = [...(pdfData?.steps ?? [])];
									if (!steps[i].notes) {
										steps[i].notes = '';
									}
									setPdfData({ ...pdfData, steps });
								},
								handleAddTips: (i: number) => {
									const steps = [...(pdfData?.steps ?? [])];
									if (!steps[i].tooltip) {
										steps[i].tooltip = '';
									}
									setPdfData({ ...pdfData, steps });
								},
								handleAddLink: (i: number) => {
									const steps = [...(pdfData?.steps ?? [])];
									if (!steps[i].url) {
										steps[i].url = '';
									}
									setPdfData({ ...pdfData, steps });
								},
								debouncedSetPdfData,
							}}
						/>
					))}
					<div className='flex justify-center items-center ml-10'>
						<Button icon={<Plus />} onClick={handleAddStep} disabled={isAddStepDisabled} />
					</div>
				</div>
			</SortableContext>
		</DndContext>
	);
};

export default StepsContainer;
