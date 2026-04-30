# Stage 1: Build stage
FROM node:22-slim AS builder
WORKDIR /app

# Define the arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

# Make them available as environment variables for the build process
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Install pnpm (or npm)
RUN npm install -g pnpm

# Copy dependency files first for better caching
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code and build
COPY . .
RUN pnpm run build

# Stage 2: Production stage (Serving the app)
FROM nginx:alpine
# Copy the 'dist' folder from the builder stage to Nginx's serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]