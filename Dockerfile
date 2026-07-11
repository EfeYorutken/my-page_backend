FROM denoland/deno:alpine-2.1.4

# Set the working directory inside the container
WORKDIR /app

# Prefer running as a non-privileged user for container security
USER deno

# Cache the dependencies first to optimize Docker layer caching
COPY package.json ./
# Deno natively reads package.json dependencies and caches them securely
#RUN deno install

# Copy the rest of your source code into the working directory
COPY . .

# Expose the internal container port
EXPOSE 3141

# Run the entrypoint file directly with necessary security permissions flags
CMD ["deno","run", "--allow-net", "--allow-env"]
