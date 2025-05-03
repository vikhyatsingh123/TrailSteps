import _ from 'lodash';

import DomPicker from './DomPicker';

class Recorder {
	private domPicker: DomPicker | null = null;
	private state: string = 'idle';

	faviconURL = (u: string) => {
		const url = new URL(chrome.runtime.getURL('/_favicon/'));
		url.searchParams.set('pageUrl', u);
		url.searchParams.set('size', '32');
		return url.toString();
	};

	recurse = async (): Promise<void> => {
		if (chrome.runtime.id === undefined) {
			return;
		}
		try {
			const results = await this.domPicker?.pick();
			const tagname = results?.target.tagName?.toLowerCase?.();

			if (results && tagname) {
				// this is needed to highlight the selected element while capturing the screenshot
				const overlay = document.createElement('div');
				overlay.style.position = 'absolute';
				overlay.style.border = '3px solid #F05D3E';
				overlay.style.borderRadius = '8px';
				overlay.style.left = `${results?.target.getBoundingClientRect().left}px`;
				overlay.style.top = `${results?.target.getBoundingClientRect().top}px`;
				overlay.style.width = `${results?.target.getBoundingClientRect().width}px`;
				overlay.style.height = `${results?.target.getBoundingClientRect().height}px`;
				overlay.style.zIndex = '999999999';
				if (results.breadcrumb !== 'HTML') {
					document.body.appendChild(overlay);
				}

				if (chrome.runtime.id === undefined) {
					return;
				}
				// Send a message to the background script to capture the tab
				chrome.runtime.sendMessage({ type: 'captureScreenshot' }, (response) => {
					if (response?.dataURI) {
						const { target, event, breadcrumb } = results;
						if (
							target.tagName.toLowerCase() === 'a' ||
							target.parentElement?.tagName.toLowerCase() === 'a'
						) {
							const href = (
								target.tagName.toLowerCase() === 'a'
									? (target as HTMLAnchorElement)
									: (target.parentElement as HTMLAnchorElement)
							).href;
							if (href) {
								window.location.href = href;
							}
						}

						void chrome.runtime.sendMessage({
							text: 'selectedItem',
							breadcrumb,
							pageTitle: document.title,
							pageIcon: this.faviconURL(document.baseURI),
							pageDescription: document
								.querySelector('meta[name="description"]')
								?.getAttribute('content'), // this can be undefined
							type: target.tagName,
							baseURI: target.baseURI,
							dataURI: response.dataURI,
							innerText: _.isEmpty(target.textContent)
								? _.isEmpty(target.ariaLabel)
									? ''
									: target.ariaLabel
								: target.textContent,
							coordinates: {
								pageX: event.pageX,
								pageY: event.pageY,
								clientX: event.clientX,
								clientY: event.clientY,
								timestamp: new Date().toLocaleString(),
							},
							screenSize: {
								width: window.innerWidth,
								height: window.innerHeight,
							},
						});
						if (results.breadcrumb !== 'HTML') {
							document.body.removeChild(overlay);
						}
					}
				});
			}
			void this.recurse();
		} catch (error) {
			console.error('Error in Recorder.recurse:', error);
			this.stop();
		}
	};

	start = (): void => {
		if (chrome.runtime.id === undefined || this.state === 'recording') {
			return;
		}
		this.state = 'recording';
		void chrome.storage.local.set({ isCapturing: true });
		this.domPicker = new DomPicker();
		void this.recurse();
	};

	stop = (): void => {
		if (chrome.runtime.id === undefined) {
			return;
		}
		this.state = 'idle';
		this.domPicker?.cancel();
		void chrome.storage.local.set({ isCapturing: false });
		this.domPicker = null;
	};
}

const instance = new Recorder();
export default instance;
