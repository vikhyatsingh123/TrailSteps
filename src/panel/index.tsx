import '../styles/index.css';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Button, Col, Collapse, CollapseProps, Modal, Row, Tooltip, Typography } from 'antd';
import { CheckOne, Delete, PauseOne, PlayOne, Undo } from '@icon-park/react';
import { createRoot } from 'react-dom/client';

interface IElementObject {
	isNavigated?: boolean;
	breadcrumb?: string;
	pageIcon?: string;
	pageTitle?: string;
	pageDescription?: string;
	type?: string;
	baseURI?: string;
	dataURI?: string;
	innerText?: string;
	coordinates?: {
		pageX: number;
		pageY: number;
		clientX: number;
		clientY: number;
		timestamp: string;
	};
	screenSize?: {
		width: number;
		height: number;
	};
}

const Panel: React.FC = () => {
	const [selectedElement, setSelectedElement] = useState<IElementObject[]>([]);
	const [isCapturing, setIsCapturing] = useState<boolean>(false);
	const [isPaused, setIsPaused] = useState<boolean>(false);
	const [activeKey, setActiveKey] = useState<number | string[] | undefined>(undefined);

	useEffect(() => {
		const listener = (request: any) => {
			if (request.text === 'selectedItem') {
				const elementDetails = {
					breadcrumb: request.breadcrumb,
					pageTitle: request.pageTitle,
					pageDescription: request.pageDescription,
					type: request.type,
					pageIcon: request.pageIcon,
					baseURI: request.baseURI,
					dataURI: request.dataURI,
					innerText: request.innerText,
					coordinates: request.coordinates,
					screenSize: request.screenSize,
				};

				const navigatedDetails = {
					isNavigated: true,
					pageIcon: request.pageIcon,
					pageTitle: request.pageTitle,
					baseURI: request.baseURI,
					pageDescription: request.pageDescription,
				};

				setSelectedElement((prevElements) => {
					if (prevElements.length === 0) {
						return [navigatedDetails, elementDetails];
					}
					if (prevElements[prevElements.length - 1].pageTitle !== request.pageTitle) {
						return [...prevElements, navigatedDetails, elementDetails];
					}
					return [...prevElements, elementDetails];
				});
			}
		};

		chrome.runtime.onMessage.addListener(listener);

		return () => {
			chrome.runtime.onMessage.removeListener(listener);
		};
	}, []);

	useEffect(() => {
		chrome.runtime.connect({ name: 'portConnectionToSidePanel' });
	}, []);

	useEffect(() => {
		setActiveKey(_.size(selectedElement) - 1);
	}, [selectedElement]);

	const handleDiscard = () => {
		Modal.confirm({
			title: 'Discard the Recording',
			content: 'Are you sure you want to discard the recording?',
			centered: true,
			width: 300,
			okButtonProps: { className: 'primary-button bg-[#0386B5]' },
			okText: 'Discard',
			onOk: () => {
				setIsCapturing(false);
				setIsPaused(false);
				setSelectedElement([]);
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					void chrome.tabs.sendMessage(tabs[0].id as number, { text: 'DapStop' });
				});
			},
		});
	};

	const handleStart = async () => {
		setIsCapturing(true);
		setIsPaused(false);
		chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
			void chrome.tabs.sendMessage(tab[0].id as number, { text: 'DapStart' });
		});
		return;
	};

	const handleDeleteClick = (e: any, index: number) => {
		e.stopPropagation();
		const newElements = [...selectedElement];
		newElements.splice(index, 1);
		setSelectedElement(newElements);
	};

	const handlePause = () => {
		setIsPaused(true);
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			void chrome.tabs.sendMessage(tabs[0].id as number, { text: 'DapStop' });
		});
	};

	const handleResume = () => {
		setIsPaused(false);
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			void chrome.tabs.sendMessage(tabs[0].id as number, { text: 'DapStart' });
		});
	};

	const handleRefresh = () => {
		Modal.confirm({
			title: 'Restart the Recording',
			content: 'Are you sure you want to restart the recording?',
			centered: true,
			width: 300,
			okButtonProps: { className: 'primary-button bg-[#0386B5]' },
			okText: 'Restart',
			onOk: () => {
				setSelectedElement([]);
				setIsPaused(false);
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					void chrome.tabs.sendMessage(tabs[0].id as number, { text: 'DapStart' });
				});
			},
		});
	};

	chrome.tabs.query({ active: true, currentWindow: true }, async () => {
		const getCapturing = () => {
			return new Promise((resolve) => {
				chrome.storage.local.get('isCapturing', (data) => {
					resolve(data.isCapturing);
				});
			});
		};

		const isStartedCapturing = await getCapturing();
		if (isPaused) {
			setIsCapturing(true);
		} else {
			setIsCapturing(isStartedCapturing as boolean);
		}
	});

	const handleSubmit = () => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			void chrome.tabs.sendMessage(tabs[0].id as number, { text: 'DapStop' });
		});

		chrome.tabs.create({ url: 'http://localhost:2000/create-tipsheet' }, (tab) => {
			// Wait until the new tab has fully loaded, then send the data
			chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
				if (tabId === tab.id && changeInfo.status === 'complete') {
					void chrome.tabs.sendMessage(tabId, { action: 'sendFinalData', data: selectedElement });
				}
			});
		});
	};

	const handleChange: CollapseProps['onChange'] = (key) => {
		setActiveKey(key);
	};

	const items: CollapseProps['items'] = _.map(selectedElement, (element: IElementObject, index: number) => {
		if (element.isNavigated) {
			return {
				key: index,
				label: (
					<Row className='flex items-center justify-between hover:bg-slate-200 p-2 rounded-lg'>
						<Col span={2} className='w-6 h-6 bg-[#DCF2F5] rounded-[32px] flex justify-center items-center'>
							{index + 1}
						</Col>
						<Col span={4} className='flex justify-center items-center mx-1'>
							<img src={element.pageIcon} alt='page icon' width='30px' height='30px' />
						</Col>
						<Col span={15}>{`Navigated to: ${element.pageTitle}`}</Col>
						<Col span={2}>
							<Button
								icon={<Delete theme='outline' size='14' />}
								type='text'
								size='small'
								onClick={(e) => handleDeleteClick(e, index)}
							/>
						</Col>
					</Row>
				),
				children: (
					<div className='mx-3'>
						{element?.pageDescription ? `Description: ${element?.pageDescription}` : ''}
						<div>
							Link:
							{
								<a href={element.baseURI} target='blank'>
									{element.baseURI}
								</a>
							}
						</div>
					</div>
				),
			};
		}

		return {
			key: index,
			label: (
				<Row className='hover:bg-slate-200 p-2 rounded-lg'>
					<Col span={2} className='w-6 h-6 bg-[#DCF2F5] rounded-[32px] flex justify-center items-center'>
						{index + 1}
					</Col>
					<Col span={19} offset={1}>
						{`Clicked on: ${element.innerText}`}
					</Col>
					<Col span={2}>
						<Button
							icon={<Delete theme='outline' size='14' />}
							type='text'
							size='small'
							onClick={(e) => handleDeleteClick(e, index)}
						/>
					</Col>
				</Row>
			),
			children: <img src={element.dataURI} alt='screenshot' width='100%' className='rounded' />,
		};
	});

	return (
		<div className='py-2'>
			{isCapturing ? (
				<div>
					<div style={{ height: 'calc(100vh - 90px)' }} className='overflow-y-auto'>
						{_.isEmpty(selectedElement) ? (
							<div className='text-sm px-6 pt-4 text-gray-500'>
								Click on the screen to capture the steps with TrailSteps
							</div>
						) : (
							<Collapse
								expandIcon={() => null}
								activeKey={activeKey}
								accordion
								items={items}
								ghost
								className='p-0 m-0 collapse-element'
								onChange={handleChange}
							/>
						)}
					</div>
					<div className='w-full flex items-center justify-center'>
						<div className='flex px-6 py-2 mt-2 items-center justify-between w-2/3 bg-[#FAFAFA] floating-control'>
							<Tooltip title='Submit' placement='top'>
								<Button
									icon={
										<CheckOne
											theme='two-tone'
											size='22'
											fill={['#fff', '#0386B5']}
											className='p-3'
										/>
									}
									className='border-none shadow'
									onClick={handleSubmit}
								/>
							</Tooltip>
							<Tooltip title='Restart' placement='top'>
								<Button
									icon={<Undo theme='outline' size='18' fill='#333' className='p-3' />}
									className='border-none shadow p-3'
									onClick={handleRefresh}
								/>
							</Tooltip>
							{isPaused ? (
								<Tooltip title='Resume' placement='top'>
									<Button
										icon={<PlayOne theme='outline' size='18' fill='#333' className='p-3' />}
										className='border-none shadow'
										onClick={handleResume}
									/>
								</Tooltip>
							) : (
								<Tooltip title='Pause' placement='top'>
									<Button
										icon={<PauseOne theme='outline' size='18' fill='#333' className='p-3' />}
										className='border-none shadow'
										onClick={handlePause}
									/>
								</Tooltip>
							)}
							<Tooltip title='Discard' placement='top'>
								<Button
									icon={<Delete theme='outline' size='18' fill='#ff0303' className='p-3' />}
									className='border-none shadow'
									onClick={handleDiscard}
								/>
							</Tooltip>
						</div>
					</div>
				</div>
			) : (
				<div className='flex justify-center items-center h-[90vh] text-center pl-5 pr-6 '>
					<div>
						<Typography.Title level={4} className='!font-medium'>
							Ready to capture your steps?
						</Typography.Title>
						<div className='text-base text-[#4e4d4d]'>Click on your screen to start capturing</div>
						<Button
							className='bg-[#0386B5] primary-button text-white mt-6'
							onClick={() => void handleStart()}
						>
							Get Started
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

const container = document.getElementById('root') ?? document.body;
const root = createRoot(container);
root.render(<Panel />);
