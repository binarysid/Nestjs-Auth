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

👌 **Now your project is fully configured and ready to use!** 🚀
