// This file simulates the contents of app.js, responsible for all
// frontend logic, UI updates, and connecting user actions to the backend (firestore.js).

// =========================================================================
// UI Utility Functions (Message Box)
// =========================================================================

const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');

/** Shows a custom modal message to the user.
 * @param {string} message - The message content.
 * @param {boolean} isError - If true, displays a red error indicator.
 */
window.showMessage = (message, isError = false) => {
    messageText.textContent = message;
    if (isError) {
        messageText.classList.add('text-red-600');
        messageText.classList.remove('text-gray-800');
    } else {
        messageText.classList.add('text-gray-800');
        messageText.classList.remove('text-red-600');
    }
    messageBox.classList.remove('hidden');
};

/** Hides the custom modal message. */
window.hideMessage = () => {
    messageBox.classList.add('hidden');
};

// =========================================================================
// AI Simulation & Rendering Logic
// =========================================================================

const violationOverlay = document.getElementById('violationOverlay');
const detectionCountDisplay = document.getElementById('detectionCount');

// Define the simulated AI detections (bounding boxes and labels)
const simulatedDetections = [
    { label: 'NO HELMET', color: 'border-yellow-400', class: 'no-helmet', x: 20, y: 35, w: 35, h: 45 },
    { label: 'TRIPLE RIDING', color: 'border-blue-400', class: 'triple-riding', x: 15, y: 30, w: 50, h: 60 },
    { label: 'ILLEGAL PLATE', color: 'border-red-500', class: 'illegal-plate', x: 58, y: 65, w: 20, h: 30 },
    { label: 'WRONG WAY', color: 'border-red-500', class: 'wrong-way', x: 65, y: 40, w: 25, h: 40 },
];

/**
 * Renders the simulated AI detections onto the overlay.
 */
const renderDetections = () => {
    // Clear previous detections
    violationOverlay.innerHTML = '';
    
    // Randomly determine which violations are currently detected
    const activeDetections = simulatedDetections.filter(() => Math.random() < 0.7);

    activeDetections.forEach(detection => {
        // Create the bounding box element
        const box = document.createElement('div');
        box.classList.add('bounding-box', detection.color);
        // Apply randomized, scaled position and size (using percentage)
        box.style.left = `${detection.x + Math.random() * 5}%`;
        box.style.top = `${detection.y + Math.random() * 5}%`;
        box.style.width = `${detection.w}%`;
        box.style.height = `${detection.h}%`;
        
        // Create the label element
        const label = document.createElement('div');
        label.classList.add('label', detection.class);
        label.textContent = detection.label;

        // Append to the overlay
        box.appendChild(label);
        violationOverlay.appendChild(box);
    });

    // Update the violation count display
    detectionCountDisplay.textContent = `${activeDetections.length} Violations Detected`;
    return activeDetections;
};

// =========================================================================
// Clock and Time Update
// =========================================================================

const currentTimeDisplay = document.getElementById('currentTime');

/**
 * Updates the current time in the UI every second.
 */
const updateTime = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    currentTimeDisplay.textContent = formattedTime;
};

// =========================================================================
// Evidence Logging (Frontend Renderer)
// =========================================================================

const violationLogContainer = document.getElementById('violationLogContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

/**
 * Renders the live list of violations received from the Firestore listener.
 * This function is called by the firestore.js script via window.updateLog.
 * @param {Array<Object>} violations - List of violation objects.
 */
window.updateLog = (violations) => {
    violationLogContainer.innerHTML = ''; // Clear existing list
    loadingSpinner.classList.add('hidden');

    if (violations.length === 0) {
        violationLogContainer.innerHTML = '<p class="text-center py-4 text-gray-500">No violations recorded yet.</p>';
        return;
    }

    violations.forEach(violation => {
        const entry = document.createElement('div');
        entry.classList.add('list-entry', 'p-3', 'rounded-lg', 'border', 'border-gray-300', 'flex', 'flex-col', 'shadow-sm', 'bg-white');
        
        // Determine color for the status pill
        let statusColor = 'bg-yellow-100 text-yellow-800';
        if (violation.status === 'COMPLETED') statusColor = 'bg-green-100 text-green-800';

        entry.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-semibold text-gray-800">${violation.violationTypes.join(', ')}</span>
                <span class="px-2 py-0.5 text-xs font-medium rounded-full ${statusColor}">${violation.status.replace('_', ' ')}</span>
            </div>
            <div class="text-xs text-gray-600 mb-2">
                Time: <span class="font-mono">${violation.timestamp}</span>
            </div>
            <div class="text-xs text-gray-500">
                Operator: <span class="font-mono">${violation.recordedByUserId.substring(0, 10)}...</span>
            </div>
        `;
        violationLogContainer.appendChild(entry);
    });
};


// =========================================================================
// Event Handlers (User Interaction)
// =========================================================================

const captureButton = document.getElementById('captureButton');

/**
 * Handles the "Record Evidence" button click.
 */
const handleCapture = () => {
    // 1. Get current time and active violations
    const now = new Date();
    const activeDetections = renderDetections(); // Re-render/get the current simulated state

    if (activeDetections.length === 0) {
        showMessage("No violations detected right now. Nothing to record.", true);
        return;
    }

    // 2. Construct the violation data object
    const violationData = {
        violationTypes: activeDetections.map(d => d.label),
        captureTimeLocal: now.toISOString(),
        location: 'Tamil Nadu Highway, Kanyakumari (Simulated)',
        gps: { lat: 8.0883, lon: 77.5385 }, // Simulated coordinates for Kanyakumari
        // In a real app, 'evidenceUrl' would be a link to the stored image/video
        evidenceUrl: `https://placehold.co/400x300/4f46e5/ffffff?text=${activeDetections.length}+Violations`
    };

    // 3. Call the backend function defined in firestore.js (window.recordViolation)
    if (typeof window.recordViolation === 'function') {
        window.recordViolation(violationData);
    } else {
        console.error("recordViolation function is not defined (firestore.js missing or not loaded).");
        showMessage("Error: Database connection not ready.", true);
    }
};


// =========================================================================
// Main Initialization
// =========================================================================

window.onload = () => {
    // Start time updates
    setInterval(updateTime, 1000);
    updateTime(); // Initial call

    // Start AI simulation rendering (updates every 2 seconds)
    setInterval(renderDetections, 2000);
    renderDetections(); // Initial call

    // Attach event listener for the capture button
    captureButton.addEventListener('click', handleCapture);

    // Start the authentication and database listeners defined in firestore.js
    if (typeof window.setupAuthAndListeners === 'function') {
        window.setupAuthAndListeners();
    } else {
        // If the module script is missing, display an error
        document.getElementById('loadingSpinner').textContent = 'ERROR: Database script (firestore.js) not loaded.';
        console.error("setupAuthAndListeners function is not defined (firestore.js missing).");
    }
};