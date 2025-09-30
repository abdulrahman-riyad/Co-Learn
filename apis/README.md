# CoLearn APIs Documentation

This repository contains the API documentation for CoLearn, a collaborative learning platform. The documentation is organized into several sections to help users understand and utilize the various features of CoLearn.

## Table of Contents
- [Configuration and Setup](#configuration-and-setup)
- [API Endpoints](#api-endpoints-v1)
    - [User Management](#user-management)
        - [User Model](#user-model)
        - [Endpoints](#endpoints)
            - [Get All Users](#get-all-users)
            - [Get User by ID](#get-user-by-id)
            - [Create User](#create-user)
            - [Update User](#update-user)
            - [Delete User](#delete-user)
            - [Get Current User](#get-current-user)
            - [Get Users by Classroom (Not Ready)](#get-users-by-classroom-not-ready)

    - [Authentication](#authentication)
        - [Endpoints](#endpoints-1)


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

#### Get All Users
| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/users` |
| Method | GET |
| Autentication Required | No |
| Success Status | 200 |
| Success Response | `{ users: [{id, firstName, lastName, email, picture}] }` |
| Error Status | 400 |
| Error Message | `{ message: [VARIABLE_ERROR_MESSAGE]}` |

#### Get User by ID
| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/users/:id` |
| Method | GET |
| Success Status | 200 |
| Success Response | `{ user: USER_OBJECT }` |
| Error Status | 404, 400 |
| Error Message | `404: {message: "User not found"}`<br>`400: {message: [VARIABLE_ERROR_MESSAGE]}` |

#### Create User
| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/users` |
| Method | POST |
| Body Parameters | `firstName`, `lastName`, `email`, `password`, `picture`(optional) |
| Success Status | 201 |
| Success Response | `{ user: USER_OBJECT }` |
| Error Status | 400, 409 |
| Error Message | `400: {message: [VARIABLE_ERROR_MESSAGE]}`<br>`409: {message: "User with the same email already exists"}` |

#### Update User
| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/users/:id` |
| Method | PUT |
| Body Parameters | Any user fields to update, refer to the [User Model](#user-model) for more info, parameters names should be case sensitive |
| Success Status | 200 |
| Success Response | `{ user: USER_OBJECT }` |
| Error Status | 400 |
| Error Message | `{message: [VARIABLE_ERROR_MESSAGE]}` |

#### Delete User
| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/users/:id` |
| Method | DELETE |
| Headers | `Authorization: Bearer TOKEN` |
| Success Status | 200 |
| Success Response | `{ message: "User deleted successfully" }` |
| Error Status | 404, 400 |
| Error Message | `404:{ message: "User not found" }`<br>`400:{ message: [VARIABLE_ERROR_MESSAGE] }` |

#### Get Current User
| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/users/me` |
| Method | GET |
| Headers | `Authorization: Bearer TOKEN` |
| Success Status | 200 |
| Success Response | `{ user: USER_OBJECT }` |
| Error Status | 401, 403, 500 |
| Error Message | `401: { message: "Unauthorized, token verification failed" }` when the jwt fail to verify the user <br> `401: { message: "Unauthorized, no authorization provided" }` when the `Authorization` header is not present <br> `403: { message: "Unauthorized, jwt token is invalid" }` when the token is invalid <br> `403: { message: "Unauthorized, User not found" }` when user is not found <br> `500: { message: "jwt secret is not defined" }` when the jwt secret is not set in the environment variables |

#### Get Users by Classroom `(NOT READY)`
| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/users/c/:classroomId` |
| Method | GET |
| Headers | `Authorization: Bearer TOKEN` |
| Success Status | 200 |
| Success Response | `{ users: [USER_OBJECTS] }` |
| Error Status | 404 |
| Error Message | "Classroom not found" |


## Authentication

### Endpoints
#### Login
| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/auth/login` |
| Method | POST |
| Body Parameters | `email`, `password` |
| Success Status | 200 |
| Success Response | `{ token: JWT_TOKEN, user: USER_OBJECT, message: "User logged in successfully" }` |
| Cookies-set | `refreshToken` (httpOnly, secure) |
| Error Status | 401 |
| Error Message | `401: { message: "User credentials is not provided" }` when the email or password is missing<br>`401: { message: "User credentials is invalid" }` when the email or password is incorrect |

#### Register

| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/auth/register` |
| Method | POST |
| Body Parameters | `firstName`, `lastName`, `email`, `password`, `picture`(optional) |
| Success Status | 201 |
| Success Response | `{ message: "User registered successfully" }` |
| Error Status | 400 |
| Error Message | "Email already exists" or "Invalid input data" |

#### Logout

| Detail | Value |
|--------|--------|
| Endpoint | `/api/v1/auth/logout` |
| Method | POST |
| Headers | `Authorization: Bearer TOKEN` |
| Success Status | 200 |
| Success Response | `{ message: "Logged out successfully" }` |
| Error Status | 401 |
| Error Message | "Not authenticated" |