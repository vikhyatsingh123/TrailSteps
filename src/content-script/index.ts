import Recorder from './Recorder';

chrome.runtime.onMessage.addListener((request) => {
	if (request.text === 'DapStart') {
		Recorder.start();
	} else if (request.text === 'DapStop') {
		Recorder.stop();
	}
});

// this is for the case when the user clicks on the start recording button on webpage
window.addEventListener('message', (event) => {
	if (event.data.action === 'startRecording') {
		Recorder.start();
	} else if (event.data.action === 'stopRecording') {
		Recorder.stop();
	}
});

// Function to create and show the modal with tabs
const createModalWithTabs = (tabs: any) => {
	const modal = document.createElement('div');
	modal.style.position = 'fixed';
	modal.style.top = '0';
	modal.style.left = '0';
	modal.style.width = '100%';
	modal.style.height = '100%';
	modal.style.display = 'flex';
	modal.style.justifyContent = 'center';
	modal.style.alignItems = 'center';
	modal.style.inset = '0';
	modal.style.backgroundColor = '#000000c4';
	modal.style.zIndex = '999999999';

	const modalContent = document.createElement('div');
	modalContent.style.backgroundColor = 'white';
	modalContent.style.padding = '24px';
	modalContent.style.borderRadius = '24px';
	modalContent.style.maxHeight = '70vh';
	modalContent.style.width = '600px';

	const modalTitle = document.createElement('p');
	modalTitle.textContent = 'Capture Option';
	modalTitle.style.marginTop = '0';
	modalTitle.style.fontWeight = '500';
	modalTitle.style.fontSize = '20px';
	modalTitle.style.marginBottom = '0';
	const modalSubtitle = document.createElement('p');
	modalSubtitle.textContent = 'Select the tab you want to capture and our smart guide will redirect you to that tab';
	modalSubtitle.style.marginBottom = '16px';
	modalSubtitle.style.marginTop = '6px';
	modalSubtitle.style.fontSize = '14px';
	modalContent.appendChild(modalTitle);
	modalContent.appendChild(modalSubtitle);

	const cardParent = document.createElement('div');
	cardParent.style.overflowY = 'auto';
	cardParent.style.maxHeight = '50vh';
	const card = document.createElement('div');
	card.style.display = 'flex';
	card.style.flexDirection = 'column';
	card.style.justifyContent = 'center';
	card.style.alignItems = 'center';
	card.style.width = '98%';

	tabs.forEach((tab: any) => {
		const btn = document.createElement('button');
		btn.style.padding = '16px 24px 16px 24px';
		btn.style.margin = '8px 0';
		btn.style.width = '100%';
		btn.style.display = 'flex';
		btn.style.alignItems = 'center';
		btn.style.gap = '16px';
		btn.style.cursor = 'pointer';
		btn.style.backgroundColor = 'white';
		btn.style.border = '1px solid #D9D9D9';
		btn.style.borderRadius = '16px';

		const img = document.createElement('img');
		img.src = tab.favIconUrl;
		img.alt = tab.title;
		img.style.width = '32px';
		img.style.height = '32px';
		img.style.objectFit = 'contain';

		const textSpan = document.createElement('span');
		textSpan.textContent = tab.title;
		textSpan.style.fontWeight = '500';
		textSpan.style.fontSize = '16px';
		btn.appendChild(img);
		btn.appendChild(textSpan);

		btn.addEventListener('mouseenter', () => {
			btn.style.backgroundColor = '#248497';
			textSpan.style.color = '#fff';
		});

		btn.addEventListener('mouseleave', () => {
			btn.style.backgroundColor = '#fff';
			textSpan.style.color = '#000';
		});

		btn.addEventListener('click', () => {
			modal.remove(); // Remove the modal when clicking on a tab
			let basePath: string;
			if (window.location.origin.includes('.tech')) {
				const match = window.location.pathname.match(/\/[^/]+\//);
				if (match) {
					basePath = match[0];
				} else {
					basePath = window.location.pathname + '/';
				}
			} else {
				basePath = '/';
			}
			chrome.runtime
				.sendMessage({ type: 'switchTab', tabId: tab.id, windowId: tab.windowId })
				.then((response) => {
					if (response.success) {
						void chrome.runtime.sendMessage({
							type: 'open_side_panel',
							tabId: tab.id,
							windowId: tab.windowId,
						});
						void chrome.storage.local.set({ jeevesUrl: `${window.location.origin}${basePath}` });
					}
				})
				.catch((error) => {
					console.error('[switchTab] Error while switching tab:', error);
				});
		});
		card.appendChild(btn);
	});
	cardParent.appendChild(card);
	modalContent.appendChild(cardParent);
	modal.appendChild(modalContent);

	// Add close functionality on click outside the modal content
	modal.addEventListener('click', (event) => {
		if (event.target === modal) {
			modal.remove();
		}
	});

	document.body.appendChild(modal);
};

window.addEventListener('message', (event) => {
	if (event.data === 'openSidePanel' && chrome.runtime?.id) {
		chrome.runtime.sendMessage({ type: 'showAllTabList' }, (tabs) => {
			createModalWithTabs(tabs);
			// we are getting tab url also in tabs object to store in side panel to check for jeeves url
		});
	}
});

// this is for the case when the user switch the tab
window.onfocus = async () => {
	// use null-safe operator since chrome.runtime is lazy initiated and might return undefined
	if (chrome.runtime?.id) {
		const getCapturing = () => {
			return new Promise((resolve) => {
				chrome.storage.local.get('isCapturing', (data) => {
					resolve(data.isCapturing);
				});
			});
		};

		const isStartedCapturing = await getCapturing();
		if (isStartedCapturing) {
			Recorder.start();
		} else {
			Recorder.stop();
		}
	}
};

// this is for the case when the user click on any route or link which either reload the page / navigate to another page in the same tab
chrome.storage.local.get('isCapturing', (data) => {
	if (data.isCapturing) {
		Recorder.start();
	} else {
		Recorder.stop();
	}
});

let receivedData: any = null;
// this is the case to send data in jeeves webpage from side panel
chrome.runtime.onMessage.addListener((message) => {
	if (message.action === 'sendFinalData') {
		receivedData = message.data;
	}
});

window.addEventListener('message', (event) => {
	if (event.data.action === 'check_dap_extension') {
		window.postMessage({ action: 'checked_dap_extension', data: true }, '*');
	} else if (event.data.action === 'getTipsheetData' && receivedData) {
		window.postMessage({ action: 'sendTipsheetData', data: JSON.stringify(receivedData) }, '*');
		chrome.runtime.sendMessage({ type: 'closeSidePanel' });
		receivedData = null;
	}
});
