# Build frontend
FROM node:20-alpine AS frontend_build
WORKDIR /app
COPY frontend/package.json ./package.json
RUN npm install
COPY frontend/ ./
RUN npm run build

# Serve frontend + reverse proxy via Nginx
FROM nginx:1.27-alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend_build /app/dist /usr/share/nginx/html

EXPOSE 80
