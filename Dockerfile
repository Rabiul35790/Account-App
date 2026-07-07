ARG PHP_VERSION=8.4
ARG NODE_VERSION=20

# Stage 1: Build frontend assets
FROM node:${NODE_VERSION}-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: PHP dependencies
FROM php:${PHP_VERSION}-fpm-alpine AS backend
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libzip-dev \
    unzip \
    git \
    oniguruma-dev \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    zip \
    bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy application
COPY . .
COPY --from=frontend /app/public/build /var/www/public/build

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Setup Laravel
RUN cp .env.example .env \
    && php artisan key:generate --force \
    && php artisan storage:link \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy supervisord configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
