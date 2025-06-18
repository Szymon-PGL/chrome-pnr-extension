console.log('Background service worker started');

// Function to save booking data
async function saveBookingData(bookingData, url) {
    if (!bookingData.pnrnumber) {
        console.log('No PNR number found in booking data');
        return;
    }

    const timestamp = new Date().toISOString();
    const dataEntry = {
        url: url,
        timestamp: timestamp,
        data: bookingData
    };

    try {
        // Get existing data from storage
        const result = await chrome.storage.local.get(['bookingConfirmations']);
        let confirmations = result.bookingConfirmations || [];

        // Check if this PNR already exists (prevent duplicates)
        const isDuplicate = confirmations.some(conf =>
            conf.data.pnrnumber === bookingData.pnrnumber
        );

        if (!isDuplicate) {
            confirmations.push(dataEntry);

            // Keep only last 100 confirmations
            if (confirmations.length > 100) {
                confirmations = confirmations.slice(-100);
            }

            // Save back to storage
            await chrome.storage.local.set({ bookingConfirmations: confirmations });
            console.log('Booking data saved:', dataEntry);

            // Show notification (optional)
            chrome.action.setBadgeText({ text: '!' });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });

            // Clear badge after 3 seconds
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '' });
            }, 3000);
        } else {
            console.log('Duplicate PNR, skipping save');
        }
    } catch (error) {
        console.error('Error saving booking data:', error);
    }
}

// Function to extract data from a tab
async function extractDataFromTab(tabId) {
    try {
        // Wait 1 second for page to fully load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Send message to content script
        const response = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT_BOOKING_DATA' });

        if (response && response.data && response.data.name && response.data.pnrnumber) {
            const tab = await chrome.tabs.get(tabId);
            await saveBookingData(response.data, tab.url);
        } else {
            extractDataFromTab(tabId)
        }
    } catch (error) {
        console.error('Error extracting data:', error);
    }
}

// Listen for URL changes from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'URL_CHANGED' && request.url.includes('/book/confirmation')) {
        console.log('Confirmation page detected:', request.url);
        extractDataFromTab(sender.tab.id);
    }
});

// Listen for tab updates (as backup)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' &&
        tab.url &&
        (tab.url.includes('localhost:4200') ||
        tab.url.includes('new.lotinternal.com')) &&
        tab.url.includes('/book/confirmation')) {
        console.log('Tab updated to confirmation page:', tab.url);
        extractDataFromTab(tabId);
    }
});

// Listen for navigation events
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.url.includes('/book/confirmation')) {
        console.log('Navigation completed to confirmation page:', details.url);
        extractDataFromTab(details.tabId);
    }
}, {
    url: [{ hostEquals: 'localhost', ports: [4200] },
        { hostEquals: 'new.lotinternal.com' }]
});

// Handle extension icon click to open popup
chrome.action.onClicked.addListener((tab) => {
    // This won't fire if we have a default_popup, but keeping for completeness
    console.log('Extension icon clicked');
});

// Simple icon placeholder instructions
// Create these icon files (icon16.png, icon48.png, icon128.png) with any image editor
// Or use a simple colored square as a placeholder