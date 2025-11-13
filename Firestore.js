// This file simulates the contents of firestore.js, responsible for all
// database interaction and user authentication.
// It uses Firebase modules for all operations.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, addDoc, onSnapshot, collection, query, orderBy, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// IMPORTANT: Global environment variables provided by the platform
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- INITIALIZATION ---
setLogLevel('Debug');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null;
let isAuthReady = false;

// NOTE: showMessage and updateLog are assumed to be defined by the frontend script (app.js)
// We expose them globally here, but in a real module setup, we'd use events or callbacks.

/**
 * Utility to get the correct collection reference for public data storage.
 * @returns {import("firebase/firestore").CollectionReference}
 */
const getViolationCollectionRef = () => {
    // Storing data in the public collection path: /artifacts/{appId}/public/data/violations
    return collection(db, `artifacts/${appId}/public/data/violations`);
};

// --- AUTHENTICATION FLOW ---

/**
 * Initiates Firebase authentication and sets up the listener for data updates.
 * This is the first function called by the main application logic.
 */
export const setupAuthAndListeners = async () => {
    // 1. Try to sign in with custom token (provided by the environment)
    if (initialAuthToken) {
        try {
            await signInWithCustomToken(auth, initialAuthToken);
        } catch (error) {
            console.error("Custom token sign-in failed. Proceeding to anonymous sign-in.", error);
        }
    }

    // 2. Set up auth state listener
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            console.log("Authenticated User ID:", userId);
        } else {
            // 3. Fallback to anonymous sign-in
            try {
                const anonymousUser = await signInAnonymously(auth);
                userId = anonymousUser.user.uid;
                console.log("Signed in anonymously. User ID:", userId);
            } catch (error) {
                console.error("Anonymous sign-in failed:", error);
                // Last resort: use a temporary ID if sign-in fails entirely
                userId = crypto.randomUUID();
                // Assumes showMessage is available globally
                if (typeof showMessage === 'function') {
                    showMessage("Authentication failed. Using temporary ID.", true);
                }
            }
        }

        isAuthReady = true;
        // Update the UI with the user ID
        document.getElementById('userIdDisplay').textContent = userId;
        // Proceed to start listening for database changes
        startDataListeners();
    });
};

// --- FIRESTORE FUNCTIONS (Backend Logic) ---

/**
 * Saves a new traffic violation record to Firestore.
 * @param {object} violationData - The structured violation data from the AI/Frontend.
 */
export const recordViolation = async (violationData) => {
    if (!isAuthReady || !userId) {
        if (typeof showMessage === 'function') {
            showMessage("App is not authenticated yet. Please wait.", true);
        }
        return;
    }

    try {
        await addDoc(getViolationCollectionRef(), {
            ...violationData,
            recordedByUserId: userId,
            timestamp: serverTimestamp(), // Use Firestore timestamp for chronological sorting
            status: 'PENDING_REVIEW' // Initial status
        });
        if (typeof showMessage === 'function') {
            showMessage("Evidence recorded successfully!", false);
        }
    } catch (e) {
        console.error("Error adding document: ", e);
        if (typeof showMessage === 'function') {
            showMessage(`Error recording evidence: ${e.message}`, true);
        }
    }
};

/**
 * Sets up a real-time listener to fetch the latest violation records.
 */
const startDataListeners = () => {
    if (!isAuthReady || !userId) return;

    // Query for the latest 15 violations, ordered by time recorded
    const q = query(getViolationCollectionRef(), orderBy('timestamp', 'desc'), limit(15));

    // Listen for real-time changes
    onSnapshot(q, (snapshot) => {
        const violations = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            violations.push({
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp object to a readable string
                timestamp: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Processing...'
            });
        });

        // Assumes updateLog is a function exported or available globally by app.js
        if (typeof window.updateLog === 'function') {
             window.updateLog(violations);
        }
    }, (error) => {
        console.error("Error listening to violations:", error);
        if (typeof showMessage === 'function') {
            showMessage(`Error loading log: ${error.message}`, true);
        }
    });
};

// Expose the core functions for use by the main application script (app.js)
// In a single file context, this is often done by setting them on the window object.
window.recordViolation = recordViolation;
window.setupAuthAndListeners = setupAuthAndListeners;