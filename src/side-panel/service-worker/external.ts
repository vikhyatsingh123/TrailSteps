chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
	if (request.message === 'check_extension') {
		sendResponse({ installed: true });
	}
});
