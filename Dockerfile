FROM denoland/deno:latest

WORKDIR /app

# Copy dependency configs first to leverage caching correctly
COPY deno.json* deno.lock package.json* ./

# Install dependencies using version 5 lockfile specs
RUN deno install

# Copy the rest of your backend application source files
COPY . .

EXPOSE 3000

CMD ["run", "--allow-net","--allow-read", "--allow-env", "main.ts"]
