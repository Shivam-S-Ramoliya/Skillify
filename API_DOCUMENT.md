# Skillify Full API Documentation

This document serves as a complete reference for all API routes available in the Skillify project, including Authentication, Profiles, Jobs, and Health endpoints. It defines the HTTP methods, routes, descriptions, expected inputs (Body/Query/Params/Form-Data), and the expected outputs.

## Base URL

Local Development: `http://localhost:5000`
All routes are prefixed with `/api`.

---

## Route Summary Tables

### 1. Authentication Routes (`/api/auth`)

| Method | Route                  | Description                        | Auth Req |
| :----- | :--------------------- | :--------------------------------- | :------: |
| `POST` | `/signup`              | Register a new user                |    ❌    |
| `POST` | `/login`               | Login user                         |    ❌    |
| `POST` | `/verify-email`        | Verify email with JWT link token   |    ❌    |
| `POST` | `/resend-verification` | Resend verification email          |    ❌    |
| `POST` | `/check-verification`  | Check verification & login user    |    ❌    |
| `POST` | `/forgot-password`     | Send password reset link           |    ❌    |
| `POST` | `/reset-password`      | Reset password using token         |    ❌    |
| `POST` | `/refresh`             | Refresh Access Token using cookie  |    ❌    |
| `POST` | `/logout`              | Logout & clear cookies             |    ❌    |
| `GET`  | `/me`                  | Get current logged-in user details |    ✅    |

### 2. Profile Routes (`/api/profile`)

| Method   | Route             | Description                    | Auth Req |
| :------- | :---------------- | :----------------------------- | :------: |
| `GET`    | `/discover`       | Get public profiles            |    ❌    |
| `PUT`    | `/update`         | Update user profile            |    ✅    |
| `GET`    | `/me`             | Get current user's profile     |    ✅    |
| `GET`    | `/status`         | Check profile completion       |    ✅    |
| `PUT`    | `/visibility`     | Update visibility              |    ✅    |
| `POST`   | `/upload-picture` | Upload profile picture         |    ✅    |
| `POST`   | `/upload-resume`  | Upload resume                  |    ✅    |
| `POST`   | `/request-delete` | Request account deletion (OTP) |    ✅    |
| `DELETE` | `/delete`         | Confirm account delete         |    ✅    |
| `POST`   | `/:userIdOrUsername/follow` | Follow a user        |    ✅    |
| `POST`   | `/:userIdOrUsername/unfollow` | Unfollow a user    |    ✅    |
| `POST`   | `/:userIdOrUsername/remove-follower` | Remove follower |    ✅    |
| `GET`    | `/:userId`        | Get a specific user's profile  |    ❌    |

### 3. Jobs Routes (`/api/jobs`)

_Note: Accessing job creation, discovery, and applying functionalities requires the user to have their profile visibility set to "public"._

| Method | Route                                 | Description                | Auth Req |
| :----- | :------------------------------------ | :------------------------- | :------: |
| `POST` | `/publish`                            | Publish a new job          |    ✅    |
| `GET`  | `/discover`                           | Discover recent jobs       |    ✅    |
| `GET`  | `/my-posts`                           | Get jobs posted by me      |    ✅    |
| `GET`  | `/applications/sent`                  | Applications sent by me    |    ✅    |
| `GET`  | `/applications/received`              | Applications received      |    ✅    |
| `PUT`  | `/applications/:applicationId/status` | Accept/Reject/Withdraw app |    ✅    |
| `POST` | `/:jobId/apply`                       | Apply to a job             |    ✅    |
| `PUT`  | `/:jobId/status`                      | Toggle job status          |    ✅    |

### 4. General / Operations

| Method | Route     | Description         | Auth Req |
| :----- | :-------- | :------------------ | :------: |
| `GET`  | `/health` | Server health check |    ❌    |

---

## Detailed Route Information

### 1. Authentication Routes

#### POST `/api/auth/signup`

**Description:** Register a new user
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": false,
    "profileComplete": false
  }
}
```

#### POST `/api/auth/login`

**Description:** Login user
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUz...",
  "user": {
    "id": "60d5ecb8b48...",
    "name": "John Doe",
    "email": "john@example.com",
    "profileComplete": true
  }
}
```

#### POST `/api/auth/verify-email`

**Description:** Verify email using the signed JWT token from the email link
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "token": "jwt-token-from-email-link"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUz...",
  "user": { ... }
}
```

#### POST `/api/auth/resend-verification`

**Description:** Resend verification email
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Verification email sent"
}
```

#### POST `/api/auth/forgot-password`

**Description:** Send a secure password reset link to the user's email
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "If an account exists for that email, a password reset link has been sent."
}
```

#### POST `/api/auth/reset-password`

**Description:** Reset password using the token from the email link
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successfully",
  "token": "eyJhbGciOiJIUz...",
  "user": { ... }
}
```

#### GET `/api/auth/me`

**Description:** Get current logged-in user details
**Auth Required:** Yes (`Authorization: Bearer <token>`)
**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b48...",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true,
    "profileComplete": true
  }
}
```

#### POST `/api/auth/check-verification`

**Description:** Check if user's email is verified (and log them in if so)
**Auth Required:** No
**Request Body (JSON):**

```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    "id": "60d5ecb8b48...",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "isVerified": true,
    "profileComplete": true
  }
}
```

#### POST `/api/auth/refresh`

**Description:** Refresh Access Token using Refresh Token cookie (rotates access and refresh tokens)
**Auth Required:** No (Uses `refreshToken` Cookie)
**Response (200 OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

#### POST `/api/auth/logout`

**Description:** Log user out, invalidate refresh token on server-side and clear cookies
**Auth Required:** No (Uses `refreshToken` Cookie)
**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2. Profile Routes

#### GET `/api/profile/discover`

**Description:** Get public profiles
**Auth Required:** Optional (helps exclude self if provided)
**Query Parameters:**

- `role` (Optional): Filter by role
- `skill` (Optional): Filter by skill
- `page` (Optional, default 1)
- `limit` (Optional, default 10)
  **Response (200 OK):**

```json
{
  "success": true,
  "total": 5,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "...",
      "name": "Jane Doe",
      "bio": "Software Engineer",
      "skills": ["React", "Node.js"],
      "profileVisibility": "public"
    }
  ]
}
```

#### PUT `/api/profile/update`

**Description:** Update user profile. Overwrites provided fields.
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "bio": "Dynamic developer",
  "location": "New York, NY",
  "availability": "full-time",
  "education": "BS Computer Science",
  "experience": "2 years as Frontend",
  "yearsOfExperience": 2,
  "currentRole": "Frontend Developer",
  "company": "Tech Corp",
  "skills": ["JavaScript", "React"],
  "githubUrl": "https://github.com/.../",
  "linkedinUrl": "https://linkedin.com/.../",
  "portfolioUrl": "https://...",
  "profileVisibility": "public"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profileComplete": true,
  "user": { ... }
}
```

#### GET `/api/profile/me`

**Description:** Get current user's profile
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "success": true,
  "data": { ... full user profile data ... }
}
```

#### GET `/api/profile/status`

**Description:** Check profile completion
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "profileComplete": false,
    "completionPercentage": 85,
    "missingFields": ["profilePicture", "location"]
  }
}
```

#### PUT `/api/profile/visibility`

**Description:** Update visibility
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "profileVisibility": "private"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile visibility set to private",
  "profileVisibility": "private"
}
```

#### POST `/api/profile/upload-picture`

**Description:** Upload profile picture directly to Cloudinary
**Auth Required:** Yes
**Headers:** `Content-Type: multipart/form-data`
**Body:**

- `profilePicture`: (Binary File)
  **Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "profilePicture": "https://res.cloudinary.com/..."
}
```

#### POST `/api/profile/upload-resume`

**Description:** Upload resume directly to Cloudinary
**Auth Required:** Yes
**Headers:** `Content-Type: multipart/form-data`
**Body:**

- `resume`: (Binary File)
  **Response (200 OK):**

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resume": "https://res.cloudinary.com/..."
}
```

#### POST `/api/profile/request-delete`

**Description:** Request account deletion. Generates and sends a signed confirmation link to email.
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "success": true,
  "message": "A confirmation link has been sent to your email address."
}
```

#### DELETE `/api/profile/delete`

**Description:** Confirm and execute account deletion using the signed JWT token from the email link.
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "token": "jwt-token-from-email-link"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Account and all associated data deleted successfully"
}
```

#### GET `/api/profile/:userId`

**Description:** Get a specific user's public profile
**Auth Required:** No
**Response (200 OK):**

```json
{
  "success": true,
  "data": { ... public user mapping ... }
}
```

#### POST `/api/profile/:userIdOrUsername/follow`

**Description:** Follow a user by their user ID or username
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "success": true,
  "message": "Successfully followed Jane Doe"
}
```

#### POST `/api/profile/:userIdOrUsername/unfollow`

**Description:** Unfollow a user by their user ID or username
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "success": true,
  "message": "Successfully unfollowed Jane Doe"
}
```

#### POST `/api/profile/:userIdOrUsername/remove-follower`

**Description:** Remove a user from your followers (forces them to unfollow you)
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "success": true,
  "message": "Successfully removed Jane Doe from your followers"
}
```

---

### 3. Jobs Routes

_Note: Accessing job creation, discovery, and applying functionalities requires the user to have their profile visibility set to "public"._

#### POST `/api/jobs/publish`

**Description:** Publish a new job
**Auth Required:** Yes
**Headers:** `Content-Type: multipart/form-data`
**Body Form-Data:**

- `jobName` (Text)
- `githubRepoUrl` (Text, optional)
- `jobDetails` (Text)
- `skillsRequired` (Text array or comma-separated string)
- `experienceRequired` (Text)
- `compensationType` (Text: "paid" or "unpaid")
- `salary` (Text, required if paid)
- `durationFrom` (Date string)
- `durationTo` (Date string)
- `jobDescriptionDocument` (Binary File, optional)
  **Response (201 Created):**

```json
{
  "success": true,
  "message": "Job published successfully",
  "data": { ... inserted job document ... }
}
```

#### GET `/api/jobs/discover`

**Description:** Discover recent jobs posted by others.
**Auth Required:** Yes
**Query Parameters:**

- `page` (Optional, default 1)
- `limit` (Optional, default 10)
- `skill` (Optional, string)
  **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5...",
      "jobName": "Frontend Engineer",
      "hasApplied": false,
      "applicationStatus": null,
      "postedBy": { ... }
    }
  ],
  "page": 1,
  "pages": 5,
  "total": 50
}
```

#### GET `/api/jobs/my-posts`

**Description:** Get jobs posted by the current user along with their applicant counts.
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5...",
      "jobName": "Backend Dev",
      "applicantCount": 4
    }
  ]
}
```

#### GET `/api/jobs/applications/sent`

**Description:** Applications sent by the current user.
**Auth Required:** Yes
**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "job": { ... job reference ... },
      "status": "pending"
    }
  ]
}
```

#### GET `/api/jobs/applications/received`

**Description:** Applications received on jobs posted by the current user.
**Auth Required:** Yes
**Query Parameters:**

- `jobId` (Optional, filters by specific job)
  **Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "applicant": { ... full applicant profile block ... },
      "status": "pending"
    }
  ]
}
```

#### PUT `/api/jobs/applications/:applicationId/status`

**Description:** Change the status of a specific job application. The employer can accept/reject, while the applicant can only withdraw.
**Auth Required:** Yes
**Request Body (JSON):**

```json
{
  "status": "accepted" // "accepted", "rejected", or "withdrawn"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": { ... application document ... }
}
```

#### POST `/api/jobs/:jobId/apply`

**Description:** Apply to a job
**Auth Required:** Yes
**Response (201 Created):**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "job": "60d5...",
    "applicant": "61a2...",
    "status": "pending"
  }
}
```

#### PUT `/api/jobs/:jobId/status`

**Description:** Toggle job status between "open" and "closed". Closing a job doesn't require an additional payload. Re-opening a job requires a new `closingDate` in the request body.
**Auth Required:** Yes
**Request Body (JSON - only required when re-opening a closed job):**

```json
{
  "closingDate": "2026-07-01T00:00:00.000Z"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Job is now closed",
  "data": { ... job document ... }
}
```

---

### 4. General / Operations

#### GET `/api/health`

**Description:** Server health check
**Auth Required:** No
**Response (200 OK):**

```json
{
  "message": "Server is running"
}
```

---

## Error Responses

By default, missing fields, validation failures, or server errors conform to this format:

### 400 - Bad Request

```json
{
  "success": false,
  "message": "Please provide [field name]"
}
```

### 401 - Unauthorized

```json
{
  "success": false,
  "message": "Token is not valid"
}
```

### 403 - Forbidden

```json
{
  "success": false,
  "message": "This profile is private"
}
```

### 404 - Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 - Server Error

```json
{
  "success": false,
  "message": "Server error during [operation]"
}
```
