import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import clsx from 'clsx';
import { Col, Row, Divider, Typography, Skeleton } from 'antd';
import { DragDrop } from '@uppy/react';
import { VideoCameraOutlined } from '@ant-design/icons';

import '@uppy/core/dist/style.css';
import '@uppy/drag-drop/dist/style.css';

import AppEvents, { Events } from '@admin-vite/utils/AppEvents';
import EditingPlayerWrapper from '@admin-vite/features/edit/components/player/EditPlayerWrapper';
import ImagePreview from './ImagePreview';
import base64ToFile from '@admin-vite/utils/base64ToFile';
import useImageDelete from '@admin-vite/client/recording-api/useImageUrlDelete';
import useUppyUploader from '../hooks/useUppyUploader';
import { AssetTypeEnum } from '@jeeves/apis/generated/models';
import {
	ITipsheetImage,
	ITipsheetScreenshot,
	useSelectedStep,
} from '@admin-vite/features/tip-sheet-asset-selection/store/tipSheetStore';
import { Modal } from '@jeeves/molecules';
import { ulid } from 'ulid';
import { useEditScreenContext } from '@admin-vite/features/edit/context/editScreenContext';
import { useSettings } from '@admin-vite/store/settingsStore';
import { useTracker } from '@admin-vite/features/tracker';

interface IProps {
	open: boolean;
	selectionMode: 'single' | 'multiple';
	isManualTipsheet?: boolean;
	name: string;
	streamID: string;
	assetType: AssetTypeEnum | 'video';
	assetVersion: number;
	onClose: () => void;
	onOk: (imageList: ITipsheetImage[]) => void;
}

const renderSkeleton = () => {
	return (
		<div className='asset-view-skeleton w-full'>
			<Skeleton.Node active className='!h-[280px] !w-full'>
				<VideoCameraOutlined className='text-[90px] text-[#bfbfbf]' />
			</Skeleton.Node>
		</div>
	);
};

const AddImageModal: React.FC<IProps> = (props) => {
	const {
		open,
		onOk,
		selectionMode,
		isManualTipsheet = false,
		name,
		streamID,
		assetType,
		assetVersion,
		onClose,
	} = props;

	const { trackEvent } = useTracker();
	const { recordingURLQuery } = useEditScreenContext();
	const settings = useSettings();
	const defaultMuted = settings?.mute_default ?? false;
	const [imageList, setImageList] = useState<ITipsheetImage[]>([]);
	const selectedStep = useSelectedStep();
	const videoPlayerRef = useRef<HTMLVideoElement>(null);

	const { uppy } = useUppyUploader(streamID, open, assetVersion, setImageList);
	const { mutate: deleteImage } = useImageDelete();

	const isMediaAsset = assetType === AssetTypeEnum.Media;
	const isMetadata = _.includes(document.location.href, '/metadata');

	useEffect(() => {
		if (!imageList.length || selectionMode === 'multiple') {
			return;
		}

		const hasSelectedImage = imageList.some((image) => image.selected);
		if (hasSelectedImage) {
			return;
		}

		const firstImage = _.first(imageList);
		setImageList((prev) =>
			prev.map((image) => ({
				...image,
				selected: image.id === firstImage?.id,
			})),
		);
	}, [imageList]);

	useEffect(() => {
		const addImageUrlToList = (screenshotData: ITipsheetScreenshot) => {
			if (selectionMode === 'single') {
				setImageList((prev) => [...prev, screenshotData]);
			} else {
				const imgFile = base64ToFile(screenshotData.imageUrl, screenshotData.id);
				const id = `${ulid()}.${_.last(imgFile.name.split('.'))}`;

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				imgFile.meta = {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					...imgFile.meta,
					imageId: id,
					fileKey: selectedStep?.index ? selectedStep.index + 1 : 0,
				};
				uppy.addFile(imgFile);
			}
		};
		AppEvents.subscribe(Events.CAPTURE_SCREENSHOT_FOR_TIPSHEET, addImageUrlToList);
		return () => {
			AppEvents.unsubscribe(Events.CAPTURE_SCREENSHOT_FOR_TIPSHEET, addImageUrlToList);
		};
	}, [selectionMode, selectedStep]);

	const deleteUnSelectedImages = () => {
		const unSelectedImages = _.filter(imageList, { selected: false });
		deleteImage({ imageIds: unSelectedImages.map((image) => image.id), streamId: streamID, assetVersion });
	};

	const handleOk = () => {
		if (selectionMode === 'single') {
			deleteUnSelectedImages();
		}

		onOk(imageList);
		uppy?.cancelAll();
		uppy?.destroy();
		setImageList([]);
	};

	const handleCancel = () => {
		onClose();
		setImageList([]);
		uppy?.clear();
	};

	const isUploadingFiles = useMemo(() => {
		return _.filter(imageList, (image) => image.uploading).length > 0;
	}, [imageList]);

	if (!open) {
		return null;
	}

	return (
		<Modal
			title='Add Image'
			open={open}
			destroyOnClose
			okText={'Add'}
			width={1200}
			onCancel={handleCancel}
			onOk={handleOk}
			okButtonProps={{ disabled: isUploadingFiles }}
		>
			<Row gutter={24} className='image-viewer'>
				<Col span={16}>
					<div
						className={clsx(
							'bg-[#F1F6FB] p-6 rounded-sm',
							isManualTipsheet && 'max-h-[calc(100vh-200px)] min-h-[400px]',
						)}
					>
						{recordingURLQuery?.data && isMediaAsset && (
							<EditingPlayerWrapper
								showCapture
								assetVersion={assetVersion}
								showControls
								defaultMuted={defaultMuted}
								selectedDocument={{
									url: recordingURLQuery?.data ?? '',
									name,
									search_engine_document_id: streamID,
									asset_type: assetType,
									version: assetVersion,
								}}
								closedCaptionsOnByDefault={false}
								trackEvent={trackEvent}
								renderSkeleton={renderSkeleton}
								videoComponentRef={videoPlayerRef}
							/>
						)}
						{!isMetadata && (
							<>
								{isMediaAsset && (
									<Divider style={{ width: '80%', color: '#F0F1F2' }}>
										<Typography.Text>Or</Typography.Text>
									</Divider>
								)}
								<DragDrop
									uppy={uppy}
									width='100%'
									height={!isMediaAsset ? '400px' : '100px'}
									note='Upload only .png, .jpg, .jpeg, .webp files'
								/>
							</>
						)}
					</div>
				</Col>
				<Col span={8} className='max-h-[calc(100vh-200px)] min-h-[400px] overflow-y-auto flex flex-col'>
					<div className='flex flex-col justify-between flex-1 overflow-y-scroll'>
						<ImagePreview
							isMediaAsset={isMediaAsset}
							selectionMode={selectionMode}
							imageList={imageList}
							assetVersion={assetVersion}
							onListChange={setImageList}
							streamId={streamID}
						/>
					</div>
				</Col>
			</Row>
		</Modal>
	);
};

export default AddImageModal;
