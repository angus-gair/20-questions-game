# Use the official Node.js 20 image as a base
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Copy public and .next/static to standalone directory
RUN cp -r .next/standalone ./standalone && \
    cp -r .next/static ./standalone/.next/static && \
    cp -r public ./standalone/public

# Expose port
EXPOSE 3000

# Start the application using standalone server
WORKDIR /app/standalone
CMD ["node", "server.js"]
