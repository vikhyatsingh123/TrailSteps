chrome.runtime.onMessageExternal.addListener((request, __, sendResponse) => {
	if (request.message === 'check_extension') {
		sendResponse({ installed: true });
	}
});
