# IssueFlow Backend - Execution Guide

This document provides instructions for setting up, building, and running the IssueFlow project.

## 1. Prerequisites

Ensure you have the following installed:

- **Node.js** (v18+) and **npm**
- **Docker & Docker Compose** (required to spin up the local PostgreSQL database)

## 2. Installation

Navigate to the project root and install the necessary dependencies:

```bash
npm install
```

## 3. Environment Configuration

Before running the application, you must configure your environment variables:

- Locate the .env.example file in the root directory.
- Create a copy named .env.
- Fill in the required variables (Database credentials, JWT secret, etc.).

4. Running the Application
   The system requires a database instance to be active before the API can start.
   **Step 1:** Start the Database
   Run the provided Docker compose file to spin up the PostgreSQL instance:

```bash
docker-compose up -d
```

**Step 2:** Start the API

- For Development:

```bash
    npm run start:dev
```

- For Production:

```bash
    npm run build
    npm run start:prod
```

## 5. Testing

The project includes a suite of tests to validate key behaviors.

- Unit Tests:

```bash
    npm run test
```

- E2E Tests:

```bash
    npm run test:e2e
```

## Notes

- The API endpoints follow the contract defined in the README.md.
- Ensure the database container is healthy before running the application or the test suite.
- Use an API client (like Postman or Insomnia) to interact with the endpoints after the server is live.
