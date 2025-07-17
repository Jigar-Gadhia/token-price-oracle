# Historical Token Price Oracle

A web application for querying historical token prices on Ethereum, with a responsive Next.js frontend and an Express.js backend. The backend uses MongoDB for persistent storage, Redis for caching, and BullMQ for asynchronous job processing to fetch and store historical price data. The application supports real-time price queries and scheduled full history fetches, with retry logic for API rate limits.

## Features
- **Price Query**: Retrieve historical token prices for a given token address, network, and timestamp via `/api/price`.
- **Full History Scheduling**: Schedule background jobs to fetch and store full historical price data via `/api/schedule`.
- **Responsive Frontend**: Built with Next.js, featuring a user-friendly interface for price queries and job progress tracking.
- **Caching**: Uses Redis to cache price data for faster responses.
- **Persistent Storage**: Stores price data in MongoDB.
- **Rate Limit Handling**: Implements `p-retry` for robust API calls to external services like Alchemy and CoinGecko.
- **Dockerized Deployment**: Runs entirely in Docker with separate containers for frontend, backend, Redis, and MongoDB.

## Project Structure
```
token-price-oracle/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Backend entry point
│   │   ├── routes/            # API routes (price.ts, schedule.ts)
│   │   ├── workers/           # BullMQ workers (priceFetcher.ts)
│   ├── package.json           # Backend dependencies and scripts
│   ├── tsconfig.json          # TypeScript configuration
│   ├── .dockerignore          # Docker ignore file
│   ├── Dockerfile             # Backend Docker configuration
├── frontend/
│   ├── components/            # Next.js components (PriceDisplay.tsx, etc.)
│   ├── pages/                 # Next.js pages
│   ├── package.json           # Frontend dependencies
│   ├── .dockerignore          # Docker ignore file
│   ├── Dockerfile             # Frontend Docker configuration
├── docker-compose.yml         # Docker Compose configuration
├── .env.example               # Example environment variables
├── README.md                  # This file
```

## Prerequisites
- **Docker**: Install Docker Desktop (Windows/Mac) or Docker (Linux).
- **Node.js**: Version 18.x (for local development, optional).
- **npm**: Version 8.x or higher (for local development, optional).
- **Alchemy API Key**: Required for Ethereum blockchain data.
- **Windows Users**: Ensure WSL 2 is enabled for Docker.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd token-price-oracle
```

### 2. Configure Environment Variables
Copy the example environment file and add your Alchemy API key:
```bash
copy .env.example .env
```
Edit `.env`:
```
ALCHEMY_API_KEY=your-alchemy-api-key
REDIS_URL=redis://redis:6379
MONGODB_URL=mongodb://mongodb:27017/token-oracle
FRONTEND_URL=http://localhost:3000
```

### 3. Build and Run with Docker
Build and start all services (frontend, backend, Redis, MongoDB):
```bash
docker-compose up -d --build
```

Verify containers are running:
```bash
docker ps
```
Expected output: Four containers (`token-price-oracle_frontend-1`, `token-price-oracle_backend-1`, `token-price-oracle_redis-1`, `token-price-oracle_mongodb-1`).

### 4. Check Logs
Backend logs:
```bash
docker logs token-price-oracle-backend-1
```
Expected: `Connected to MongoDB` and `Backend running on port 4000`.

Frontend logs:
```bash
docker logs token-price-oracle-frontend-1
```
Expected: `✓ Ready in X seconds` and `http://localhost:3000`.

### 5. Access the Application
Open the frontend in your browser:
```
http://localhost:3000
```

## Usage

### Frontend
- **Price Query**:
  - Enter a token address (e.g., `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` for WETH).
  - Select network (Ethereum).
  - Enter a Unix timestamp (e.g., `1697059200` for Oct 12, 2023).
  - View the price and source in `PriceDisplay.tsx`.
- **Schedule Full History**:
  - Click "Schedule Full History" to queue a job for fetching historical data.
  - Monitor job progress via the progress bar.

### Backend API
- **Get Price**:
  ```bash
  curl "http://localhost:4000/api/price?tokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&network=ethereum&timestamp=1697059200"
  ```
  Expected response: `{"value":<price>,"source":"api"}`.

- **Schedule Full History**:
  ```bash
  curl -X POST http://localhost:4000/api/schedule -H "Content-Type: application/json" -d '{"tokenAddress":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","network":"ethereum"}'
  ```
  Expected response: `{"jobId":"<id>","progress":0}`.

- **Verify Redis Jobs**:
  ```bash
  docker exec -it token-price-oracle-redis-1 redis-cli
  llen bull:price-fetcher:jobs
  ```

- **Verify MongoDB Data**:
  ```bash
  docker exec -it token-price-oracle-mongodb-1 mongosh token-oracle
  db.prices.find()
  ```

## Local Development (Optional)
For development without Docker:
1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run start
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Troubleshooting
- **Port Conflicts** (Windows):
  ```powershell
  netstat -a -n -o | findstr "4000"
  taskkill /PID <pid> /F
  ```
- **Firewall** (Windows):
  ```powershell
  netsh advfirewall firewall add rule name="TokenOracleBackend" dir=in action=allow protocol=TCP localport=4000
  ```
- **Build Errors**:
  - Rebuild backend:
    ```powershell
    docker-compose build --no-cache backend
    ```
  - Check logs:
    ```powershell
    docker logs token-price-oracle-backend-1
    ```
- **File Case Sensitivity**:
  - Verify file names match exactly (e.g., `src/index.ts`).
  - Run:
    ```powershell
    dir backend\src
    dir backend\src\routes
    dir backend\src\workers
    ```

## Known Issues and Fixes
- **Rate Limits**: Handled by `p-retry` in `getHistoricalPrice` for CoinGecko API.
- **TypeScript Errors**: Fixed by ensuring `typescript` in `dependencies` and correct `tsconfig.json`.
- **Docker Compilation**: Uses `npm` for reliable dependency installation and execution.

## Technologies
- **Frontend**: Next.js 15.4.1, React, TypeScript
- **Backend**: Express.js 5.1.0, TypeScript 5.5.4, MongoDB (mongoose 8.16.3), Redis (ioredis 5.6.1), BullMQ 5.56.4
- **APIs**: Alchemy SDK 3.6.1, CoinGecko
- **Containerization**: Docker, Docker Compose
- **Package Manager**: npm

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License
MIT License. See [LICENSE](LICENSE) for details.