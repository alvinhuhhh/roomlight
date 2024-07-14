## BUILD
FROM node:lts-alpine AS build
# Create working directory within Docker
WORKDIR /home/app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm ci
# Copy source files
COPY . .
# Compile and build
RUN npm run build

## RUN
FROM nginx:mainline
# Copy nginx.conf to /etc
COPY nginx.conf /etc/nginx/nginx.conf
# Copy built files to nginx share directory
COPY --from=build /home/app/dist/roomlight/browser /usr/share/nginx/html

EXPOSE 3000