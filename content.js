(function() {
  // Function to extract booking data
  function extractBookingData() {
    const data = {};

    // Get PNR from booking number element
    const pnrElement = document.querySelector('.payment-confirmation__info-booking-number-value span');
    if (pnrElement) {
      data.pnrnumber = pnrElement.textContent.trim();
    }

    // Get NAME from passenger details
    const nameElement = document.querySelector('.passenger-data__details__names');
    if (nameElement) {
      data.name = nameElement.textContent.trim();
    }
    // Get departure loc

    const flights = document.querySelectorAll('lot-flight-summary');
    if(flights.length > 0) {
      data.flights = [];
    }
    flights.forEach(flight => {
      const departureloc = flight.querySelector('.flight-info__airport-iata').textContent.trim();
      const arrivallocs = flight.querySelectorAll('.flight-info__airport-iata');
      const arrivalloc = arrivallocs[arrivallocs.length - 1].textContent.trim();

      data.flights.push({departureloc, arrivalloc});
    })

    // Get departure loc
    const depdate = document.querySelector('.flight-info__date');
    if (depdate) {
      data.depdate = depdate.textContent.trim();
    }

    return data;
  }

  // Send message to background script to check URL
  function notifyBackgroundOfNavigation() {
    chrome.runtime.sendMessage({
      type: 'URL_CHANGED',
      url: window.location.href
    });
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'EXTRACT_BOOKING_DATA') {
      console.log('Received request to extract booking data');
      const bookingData = extractBookingData();
      sendResponse({ data: bookingData });
    }
  });

  // Notify background script on initial load
  notifyBackgroundOfNavigation();

  // Also listen for navigation changes (for single-page applications)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      notifyBackgroundOfNavigation();
    }
  }).observe(document, { subtree: true, childList: true });
})();