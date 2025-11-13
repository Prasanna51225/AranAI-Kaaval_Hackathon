# AranAI: Real-Time AI Traffic Enforcement System

> Developed by: Team Shield Force for the Kaaval Hackathon

## Project Status

*Hackathon Prototype* (Complete Proof-of-Concept)

*Problem Solved:* AI-powered mobile camera solution for real-time traffic violation detection (as per the Kaaval Hackathon Problem Statement).

## Value Proposition: Transforming Enforcement

The AranAI system (அரண் - Protection/Fortress) transforms the standard police camera into a smart, evidence-gathering tool. It delivers superior enforcement by focusing on three core pillars:

- *Real-time Speed:* Shifts detection from slow, manual review to immediate, real-time AI classification.
- *Tamper-Proof Evidence:* Ensures evidence is Timestamped, Geotagged, and instantly committed to a Firebase Firestore database, providing superior legal integrity.
- *Automatic Capture:* Eliminates the need for constant physical monitoring by providing an Automatic AI Overlay and Capture system.

## Solution Screenshots
These images demonstrate the two primary, high-value enforcement modes of the AranAI platform.

### 1. Moving Vehicle Enforcement (AranAI Core)
This is the primary function of the current working prototype.

*Purpose:* Real-time detection and logging of active traffic rule breaking.

*Violations Displayed:* No Helmet, Triple Riding, Wrong Way, and Illegal Plate.

![WhatsApp Image 2025-11-13 at 20 14 25_f30dc45a](https://github.com/user-attachments/assets/b6d78acd-d87b-4d0b-bdea-7e40aad3e3cb)

### 2. Digital Chalk: Smart Parking Enforcement (Future Feature)
This illustrates the platform's immediate potential for static vehicle management.

*Purpose:* Automated monitoring of time-restricted parking zones using LPR and GPS to issue e-challans for overstay violations.

![WhatsApp Image 2025-11-13 at 20 14 25_51ba066a](https://github.com/user-attachments/assets/d3125e84-bd79-4d3d-9407-ccdafeedaeee)

## Features & Simulated Workflow

This prototype demonstrates the critical end-to-end workflow for field officers:

- *Live AI Overlay:* Simulates object detection, displaying dynamic bounding boxes and labels for violations.
- *Evidence Capture:* The large central button triggers the instantaneous capture of all detected violation metadata.
- *Secure Logging:* Violation records are instantly committed to a Firebase Firestore database for secure, immutable data storage.
- *Real-time Log:* A dedicated log provides officers with an immediate, live list of all recently captured evidence.
- *Design:* The application is optimized with a *Mobile-First Design* for simple, one-handed operation in the field.

## Technology Stack

The project is built on a modern, flexible web stack:

- *Frontend/UI:* HTML (index.html), CSS (style.css), and Tailwind CSS for rapid, responsive styling.
- *Core Logic:* Vanilla JavaScript (app.js) handles the AI simulation, UI rendering, and user interactions.
- *Database/Auth:* The firestore.js module manages secure authentication and persistence using *Firebase Firestore* for the evidence log.
- *Platform:* Standard Vanilla JavaScript (ES Modules) for high performance and simple deployment.

## Quick Start (Running the Demo)

### Prerequisites

You must run the app via a web server due to the use of ES Modules (import/export in JS files).

### Setup Instructions

bash
# 1. Clone the Repository
git clone https://github.com/Prasanna51225/AranAI-Kaaval_Hackathon
cd AranAI

# 2. Serve Locally - Using Python (accessible at http://localhost:8000)
python -m http.server

# Alternative: Using Node.js live-server
npx live-server
