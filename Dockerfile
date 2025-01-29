# Stage 1: Development stage
FROM node:20 AS dev

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Install the application dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 3000

# Set the environment variable to dev
ENV NODE_ENV=dev

# Command to run the application in development mode (with hot-reload)
CMD ["npm", "run", "dev"]

# Stage 2: Production stage
FROM node:20 AS prod

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install only production dependencies
RUN npm install

# Copy the rest of the application files (excluding dev files)
COPY . .

# Build the application for production
RUN npm run build

# Expose the application port
EXPOSE 3000

# Set the environment variable to production
ENV NODE_ENV=prod

# Command to run the application in production mode
CMD ["npm", "run", "prod"]
