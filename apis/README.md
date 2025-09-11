# CoLearn APIs Documentation

This repository contains the API documentation for CoLearn, a collaborative learning platform. The documentation is organized into several sections to help users understand and utilize the various features of CoLearn.

## Table of Contents
- [Configuration and Setup](#configuration-and-setup)
- [API Endpoints](#api-endpoints)
    - [User Management](#user-management)

# Configuration and Setup
This project uses ESM modules as a default, so ensure your environment supports it. For downloading the repository dependencies, run:
```bash
npm install
```

to start the development server, use:
```bash
npm run dev
```

to start the server in testing mode, use:
```bash
npm run dev-test
```

to run the test cases using mocha, use:
```bash
npm test
```

# API Endpoints (V1)
## User Management
### User Model
The User model includes the following fields:
- `id` (UUID (String), unique identifier)
- `firstName` (String, required)
- `lastName` (String, required)
- `email` (String, required, unique)
- `password` (String, required)
- `picture` (String, optional)
- `createdAt` (Date, default: current date)

### Endpoints
| Endpoint               | Method | Description                       | Parameters                  | Response                     |
|------------------------|--------|-----------------------------------|-----------------------------|------------------------------|
| `/api/v1/users`           | GET    | Retrieve a list of users          | None                        | List of users                |
| `/api/v1/users/:id`       | GET    | Retrieve a specific user by ID | `id` (path)                 | User Object                  |
| `/api/v1/users`           | POST   | Create a new user                 | `firstName`, `lastName`, `email`, `password`, `picture`(optional) as a body params | Created user object          |
| `/api/v1/users/:id`       | PUT    | Update a user by ID               | any parameters to update | Updated user object          |
| `/api/v1/users/:id`       | DELETE | Delete a user by ID               | `id` (path)                 | Success message               |  
| `/api/v1/users/me` (Not Ready) | GET | Retrieve the authenticated user's profile | None | User Object |
| `/api/v1/users/c/:classroomId` (Not Ready) | GET | Retrieve users by classroom ID    | `classroomId` (path)       | List of users in classroom    |