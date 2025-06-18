document.addEventListener('DOMContentLoaded', function() {
  const confirmationsDiv = document.getElementById('confirmations');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');

  let lastChecksum = '';

  // Format cabin class for display
  function formatCabinClass(cabinClass) {
    const classes = {
      'E': 'Economy',
      'B': 'Business',
      'F': 'First',
      'P': 'Premium Economy'
    };
    return classes[cabinClass] || cabinClass;
  }

  // Format trip type for display
  function formatTripType(tripType) {
    const types = {
      'O': 'One Way',
      'R': 'Round Trip',
      'M': 'Multi-City'
    };
    return types[tripType] || tripType;
  }

  // Load and display confirmations
  function loadConfirmations() {
    chrome.storage.local.get(['bookingConfirmations'], function(result) {
      const confirmations = result.bookingConfirmations || [];
      const checksum = btoa(confirmations);

      if (confirmations.length === 0) {
        confirmationsDiv.innerHTML = '<div class="no-data">No booking confirmations captured yet</div>';
        return;
      }

      if(checksum !== lastChecksum) {
        lastChecksum = checksum;


      confirmationsDiv.innerHTML = '';

      // Display confirmations in reverse order (newest first)
      confirmations.reverse().forEach((confirmation, index) => {
        const confirmationDiv = document.createElement('div');
        confirmationDiv.className = 'confirmation';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'confirmation-header';
        headerDiv.textContent = `Booking: ${confirmation.data.pnrnumber || 'Unknown'} | ${confirmation.data.name}`;

        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'timestamp';
        timestampDiv.textContent = new Date(confirmation.timestamp).toLocaleString();

        confirmationDiv.appendChild(headerDiv);
        confirmationDiv.appendChild(timestampDiv);

        const route = confirmation.data.flights.map(flight => `${flight.departureloc} → ${flight.arrivalloc}`).join(', ')
        // Display booking details
        const fields = [
          { label: 'Route', value: route },
          { label: 'Date', value: confirmation.data.depdate },
          { label: 'Class', value: formatCabinClass(confirmation.data.cabinclass) },
          { label: 'Type', value: formatTripType(confirmation.data.triptype) },
          { label: 'Passengers', value: confirmation.data.passengers }
        ];

        fields.forEach(field => {
          if (field.value && field.value !== ' → ') {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'data-field';

            const fieldLabel = document.createElement('span');
            fieldLabel.className = 'field-name';
            fieldLabel.textContent = field.label + ':';

            const fieldValue = document.createElement('span');
            fieldValue.className = 'field-value';
            fieldValue.textContent = field.value;

            fieldDiv.appendChild(fieldLabel);
            fieldDiv.appendChild(fieldValue);
            confirmationDiv.appendChild(fieldDiv);
          }
        });

        confirmationsDiv.appendChild(confirmationDiv);
      });
      }
    });
  }

  // Clear all confirmations
  clearBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all booking confirmations?')) {
      chrome.storage.local.set({ bookingConfirmations: [] }, function() {
        loadConfirmations();
      });
    }
  });

  // Export confirmations as JSON
  exportBtn.addEventListener('click', function() {
    chrome.storage.local.get(['bookingConfirmations'], function(result) {
      const confirmations = result.bookingConfirmations || [];
      const dataStr = JSON.stringify(confirmations, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = 'booking_confirmations_' + new Date().getTime() + '.json';
      link.click();
    });
  });

  // Initial load
  loadConfirmations();

  // Refresh data every 2 seconds to show new captures
  setInterval(loadConfirmations, 2000);
});