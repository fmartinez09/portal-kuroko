# Base image with Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy exported standalone output
COPY output ./

# Expose port (Next.js default in standalone)
EXPOSE 3000

# Start the Next.js app
CMD ["node", "server.js"]
