import './external';

enum OnInstalledReason {
	INSTALL = 'install',
	UPDATE = 'update',
	CHROME_UPDATE = 'chrome_update',
	SHARED_MODULE_UPDATE = 'shared_module_update',
}

chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
	if ((details.reason as OnInstalledReason) === OnInstalledReason.INSTALL) {
		chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
			console.error('[onInstalled] Error while setting panel behavior');
		});
		chrome.contextMenus.create({
			id: 'open-dap',
			title: 'Open side panel',
			contexts: ['all'],
		});
		// we can show a welcome page or notification
		// chrome.tabs.create({ url: 'welcome.html' });
		console.info('[onInstalled] New installation');
	} else if ((details.reason as OnInstalledReason) === OnInstalledReason.UPDATE) {
		const currentVersion = chrome.runtime.getManifest().version;
		const previousVersion = details.previousVersion;

		console.info(`[onInstalled] Updated from version ${previousVersion} to ${currentVersion}`);

		chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
			console.error('[onUpdate] Error while setting panel behavior');
		});

		chrome.contextMenus.create({
			id: 'open-dap',
			title: 'Open side panel',
			contexts: ['all'],
		});
		chrome.notifications.create({
			type: 'basic',
			iconUrl: 'favicon/favicon-96x96.png',
			title: 'Extension Updated',
			message: `Your extension has been updated to version ${currentVersion}.`,
		});
	}

	const injectContentScripts = async (tabId: number, frameId?: number) => {
		const manifest = chrome.runtime.getManifest();
		const contentScripts = manifest.content_scripts?.[0].js;
		const target = frameId ? { tabId, frameIds: [frameId] } : { tabId, allFrames: true };

		if (!contentScripts) {
			return;
		}

		await chrome.scripting.executeScript({
			files: contentScripts,
			target,
		});
	};

	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
				injectContentScripts(tab.id).catch((error) => {
					console.error('[injectContentScripts] Error:', error);
				});
			}
		});
	});
});

// this will reload the extension when an update is available
chrome.runtime.onUpdateAvailable.addListener(() => {
	chrome.runtime.reload();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === 'open-dap') {
		// This will open the panel in all the pages on the current window.
		void chrome.sidePanel.open({ tabId: tab?.id ?? 1 });
	}
});

// for capturing the screenshot, we need "host_permissions": ["<all_urls>"] in manifest.json file
chrome.runtime.onMessage.addListener((message, __, sendResponse) => {
	if (message.type === 'captureScreenshot') {
		chrome.tabs.captureVisibleTab({ format: 'png' }, (dataURI) => {
			if (chrome.runtime.lastError) {
				sendResponse({ success: false });
			} else {
				sendResponse({ success: true, dataURI });
			}
		});

		// Keep the message channel open for asynchronous response
		return true;
	}
});

chrome.runtime.onMessage.addListener((message, __, sendResponse) => {
	if (message.type === 'open_side_panel') {
		chrome.sidePanel
			.open({ tabId: message.tabId, windowId: message.windowId })
			.then(() =>
				chrome.sidePanel.setOptions({
					tabId: message.tabId,
					path: 'panel.html',
					enabled: true,
				}),
			)
			.then(() => sendResponse({ success: true }))
			.catch((error) => {
				console.error('[open_side_panel] Error:', error);
				sendResponse({ success: false });
			});
		return true;
	}
});

chrome.runtime.onMessage.addListener((message, __, sendResponse) => {
	if (message.type === 'switchTab') {
		chrome.tabs
			.update(message.tabId, { active: true })
			.then(() => {
				sendResponse({ success: true });
			})
			.catch((error) => {
				console.error('[switchTab] Error while switching tab:', error);
			});
		return true;
	}
});

chrome.runtime.onMessage.addListener((message, __, sendResponse) => {
	if (message.type === 'showAllTabList') {
		chrome.windows.getCurrent({ populate: true }, (window) => {
			const tabs = window.tabs || [];
			sendResponse(tabs);
		});
		return true;
	}
});

// once user submit to create tipsheet, we need to close the side panel forcefully and make the side panel enabled again
chrome.runtime.onMessage.addListener((message) => {
	if (message.type === 'closeSidePanel') {
		chrome.sidePanel.setOptions({ path: chrome.runtime.getURL('panel.html'), enabled: false }).then(() => {
			chrome.sidePanel.setOptions({ path: chrome.runtime.getURL('panel.html'), enabled: true });
		});
	}
});

// this is for the case when the user directly close the side panel by clicking on X
// while dap is in start mode
chrome.runtime.onConnect.addListener((port) => {
	if (port.name === 'portConnectionToSidePanel') {
		port.onDisconnect.addListener(() => {
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				void chrome.tabs.sendMessage(tabs[0].id as number, { text: 'DapStop' });
			});
		});
	}
});
