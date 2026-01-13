\# Cost Manager - Final Project



RESTful Web Services for managing costs and generating reports.



\## Architecture

\- \*\*Process 1\*\* (Port 3001): Users Service

\- \*\*Process 2\*\* (Port 3002): Costs \& Reports Service

\- \*\*Process 3\*\* (Port 3003): Admin Service

\- \*\*Process 4\*\* (Port 3004): Logs Service



\## Team

- Ofir Nesher
- Asaf Arusi



\## Local Setup

1\. Install dependencies: `npm install` in each process folder

2\. Configure `.env` with MongoDB URI

3\. Run all: `.\\start-all.ps1`

4\. Test: `node testManual.js`



\## Deployment

Each process is deployed separately with its own URL.

