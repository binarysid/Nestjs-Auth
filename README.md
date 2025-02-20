# 🚀 Guide to Setting Up a New Project

This guide will help you configure a new NestJS-based authentication project with **registration, login, JWT token generation, refresh token, and logout** functionalities.

## 📌 Prerequisites

- Install **Node.js** (Recommended: LTS version)
- Install **Docker** (if running with Docker)
- Install **Python** (Required to run setup script)
- Install **Homebrew** (For API rate-limiting test)

---

## 🛠️ Setup Instructions

### 1️⃣ Clone This Repository

```sh
git clone git@github.com:binarysid/Nestjs-Auth.git
```

or

```sh
git clone https://github.com/binarysid/Nestjs-Auth.git
```

### 2️⃣ Run the Setup Script

```sh
python3 setup_new_app.py project-name
```

👉 This will:

- Remove Git tracking (`.git` folder)
- Rename the project
- Update `package.json` and `docker-compose` files
- Install all dependencies

### 3️⃣ Install Dependencies

```sh
npm install
```

### 4️⃣ Configure Environment Variables

The project needs `.env.dev` and `.env.prod` to run. Provide **database credentials** and **JWT values** in `.env.dev` and `.env.prod`.

### 5️⃣ Clean Up (Optional)

Once configured, you may delete the setup script:

```sh
rm setup_new_app.py
```

---

## 🚀 Running the Project

### 🐛 **Run with Docker**

#### ➤ **Build and Run Development Container**

```sh
docker-compose -f docker-compose.dev.yml up --build
```

#### ➤ **Build and Run Production Container**

```sh
docker-compose -f docker-compose.prod.yml up --build
```

#### ➤ **Remove All Docker Resources (If Needed)**

```sh
docker volume prune -f
docker container prune -f
docker image prune -a -f
docker builder prune -a -f
```

---

## ⚡ API Rate Limiting Test

**Install `wrk` with Homebrew** (on macOS):

```sh
brew install wrk
```

### Test Rate Limiting:

```sh
wrk -t1 -c20 -d20s http://localhost:3000/api/user/all
```

- `-c20` → **20 concurrent requests**
- `-d20s` → **Send requests for 20 seconds**

📌 **Throttle Configuration**: Modify limits in `throttler-type.enum.ts`.

---

## 🏰️ Compile and Run the Project

### 🔹 **Development Mode**

```sh
npm run dev
```

### 🔹 **Production Mode**

```sh
npm run prod
```

### 🔹 **Clean and Rebuild**

```sh
npm run clean
```

### 🔹 **Generate Documentation (`Compodoc`)**

```sh
npm run doc
```

👉 Then access the documentation at:  
[http://localhost:3001/](http://localhost:3001/)

---

## 📚 Swagger API Documentation

After starting the server, access the API documentation at:  
[http://localhost:3000/api/doc](http://localhost:3000/api/doc)

---

## API Implementation Guide

This section provides an overview of the API implementation, including details on authentication, token usage, session management, and how to integrate the API into your project. It is intended for both backend developers implementing the API and frontend developers consuming it.

---

### 1. **SignUp**

The SignUp API allows users to register with the system. The current implementation requires the following fields:

- `name`
- `email`
- `password`

These fields are defined in the `UserSchema` and `CreateUserDto`. If additional fields are required, the backend developer must add them to these entities.

#### For Backend Developers:

- Modify `UserSchema` and `CreateUserDto` to include additional fields if needed.
- Ensure validation rules are updated accordingly.

#### For Frontend Developers:

- Send a `POST` request to the `/user/register` endpoint with the required fields (`name`, `email`, `password`).
- Handle the response to confirm successful registration.

---

### 2. **Login and Authentication**

Upon successful login, the API returns two tokens:

- **Access Token**: Used for authenticated requests.
- **Refresh Token**: Used to obtain a new access token when the current one expires.

Both tokens have a Time-To-Live (TTL) configured in the `.env` file. These values can be adjusted based on system requirements.

#### For Backend Developers:

- Configure token TTL in the `.env` file:
  ```env
  JWT_ACCESS_TOKEN_EXPIRATION=3600 # 1 hour
  JWT_REFRESH_TOKEN_EXPIRATION=86400 # 24 hours
  JWT_SECRET=generate_this_secret
  ```

#### For Frontend Developers:

- Save both tokens securely (e.g., in HTTP-only cookies or local storage).
- Use the access token in the `Authorization` header for authenticated requests:
  ```http
  Authorization: Bearer <access_token>
  ```
- When the access token expires, call the `/auth/refresh-token` endpoint with the refresh token to obtain a new access token.

---

### 3. **Verification**

After registration, the backend developer must implement a verification mechanism (e.g., email or SMS verification). By default, the `isVerified` field in the `UserSchema` is set to `false`. Once verification is successful, this field is updated to `true`.

#### For Backend Developers:

- Uncomment the `isVerified` check in the `AuthService` and `RefreshTokenProvider` once the verification process is implemented.
- Implement the verification logic (e.g., send an email with a verification link).

#### For Frontend Developers:

- Call the `/auth/verify` endpoint to verify the user after registration.
- Handle the response to confirm successful verification.

---

### 4. **Token Usage**

Tokens are central to the authentication system:

- **Access Token**: Required in the `Authorization` header for all authenticated API requests.
- **Refresh Token**: Used to obtain a new access token when the current one expires.

#### For Frontend Developers:

- Include the access token in the `Authorization` header for authenticated requests:
  ```http
  Authorization: Bearer <access_token>
  ```
- When the access token expires, call the `/auth/refresh-token` endpoint with the refresh token to obtain a new access token and refresh token.
- Replace the old tokens with the new ones and save them securely.

---

### 5. **Session Management**

The system uses refresh tokens for session management. The `UserSession` schema stores session data by hashing the refresh token (hashing is currently commented out due to an issue under investigation).

#### Key Features:

- **Single Active Session**: Only one active session is allowed per user. If a user is already logged in on a device and tries to log in from another device, it wont allow to login before it logs out from the first device.
- **Logout**: When a user logs out, the refresh token is cleared from the session, effectively ending the session.
- **Invalid Sessions**: If a user attempts to refresh tokens with an invalid or expired refresh token, the session is cleared, and the user must log in again.

#### For Backend Developers:

- Investigate and resolve the refresh token hashing issue in the `UserSession` schema.
- Ensure session management logic aligns with system requirements.

#### For Frontend Developers:

- Call the `/auth/logout` endpoint to log out the user and clear the session.
- Handle session expiration gracefully by redirecting the user to the login page.

---

### 6. **API Collection**

A Postman collection containing all Auth/User APIs is available for reference. The collection is registered with `linkon.devin@gmail.com`. To access the collection:

1. Visit the following link:  
   [Postman Collection](https://web.postman.co/workspace/My-Workspace~4f16982a-b2cc-4651-83ef-b94e1ce092a9/collection/37686044-df531590-4459-49c5-94de-43f73457a0bf)
2. Request access permission to view and use the collection.

---

### Summary of Endpoints

| Endpoint              | Method | Description                      |
| --------------------- | ------ | -------------------------------- |
| `/user/register`      | POST   | Register a new user              |
| `/auth/login`         | POST   | Log in and obtain tokens         |
| `/auth/refresh-token` | POST   | Obtain a new access token        |
| `/auth/logout`        | POST   | Log out and clear the session    |
| `/user/verify`        | POST   | Verify a user after registration |

---

This section provides a comprehensive guide for integrating and consuming the authentication API. For further details, refer to the API documentation or the Postman collection.

---

👌 **Now your project is fully configured and ready to use!** 🚀
