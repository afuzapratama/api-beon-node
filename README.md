# Beon API (Node.js Version)

This is a Node.js migration of the original Beon API. It provides various utility services including Geolocation, User Agent parsing, Email verification, Postal code lookup (Japan), Domain availability check, Crawler detection, IP Quality scoring, and Credit Card validation.

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **MongoDB** Database
- **MaxMind GeoIP Databases** (`GeoLite2-City.mmdb`, `GeoLite2-ASN.mmdb`) placed in the `data/` directory.

## Installation

1.  **Clone the repository** (or navigate to the project folder):
    ```bash
    cd beon_api_node
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    The project uses a `.env` file for configuration. A file has been created with default values, but you should verify them.

    ```env
    PORT=3001
    
    # MongoDB Configuration
    MONGODB_URI=mongodb+srv://scapi:Lonteq123@serverlessinstance0.telzcof.mongodb.net/jp?w=majority

    # API Keys
    NEUTRINO_USER_ID=mutiaraerwinax
    NEUTRINO_API_KEY=EDjOrWq1bGA4bOOBwJYvSV8b4yTmKBmouOuWHw4Np4vie0S3
    IPQS_API_KEY=Hhg5IEG1BVQ65fnKOtcP2n6ORImsotF6
    ```

4.  **Data Files**:
    Ensure the following files exist in the `data/` directory:
    -   `GeoLite2-City.mmdb`
    -   `GeoLite2-ASN.mmdb`
    -   `dennylist.txt`

## Running the Server

-   **Development Mode** (auto-restart on file changes):
    ```bash
    npm run dev
    ```

-   **Production Mode**:
    ```bash
    npm start
    ```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

All endpoints are prefixed with `/api`.

### 1. Geolocation
Get location information for an IP address.
-   **Endpoint**: `GET /api/geolocation`
-   **Parameters**:
    -   `ip` (required): The IP address to lookup.
-   **Example**: `/api/geolocation?ip=8.8.8.8`

### 2. User Agent Parser
Parse a User Agent string to get device and browser details.
-   **Endpoint**: `GET /api/user_agent`
-   **Parameters**:
    -   `ua` (required): The User Agent string.
-   **Example**: `/api/user_agent?ua=Mozilla/5.0...`

### 3. Email Verification (Bounce Check)
Check if an email is valid, disposable, or likely to bounce.
-   **Endpoint**: `GET /api/bounce`
-   **Parameters**:
    -   `email` (required): The email address to verify.
-   **Example**: `/api/bounce?email=test@example.com`

### 4. Postal Code Lookup (Japan)
Lookup address information for a Japanese postal code.
-   **Endpoint**: `GET /api/postal/jp`
-   **Parameters**:
    -   `code` (required): The 7-digit postal code.
-   **Example**: `/api/postal/jp?code=1000001`

### 5. Domain Availability
Check if a domain name is available for registration (via GoDaddy API).
-   **Endpoint**: `GET /api/domain`
-   **Parameters**:
    -   `name` (required): The domain name to check.
-   **Example**: `/api/domain?name=example.com`

### 6. Domain Analysis (WHOIS, DNS, SSL)
Comprehensive domain analysis including WHOIS availability, DNS records, and SSL certificate status.
-   **Endpoint**: `GET /api/domain/analyze`
-   **Parameters**:
    -   `domain` (required): The domain name to analyze.
-   **Example**: `/api/domain/analyze?domain=google.com`

### 7. Crawler/Bot Detection
Check if an IP belongs to known crawlers (Googlebot, Bingbot).
-   **Endpoint**: `GET /api/blockers/crawler`
-   **Parameters**:
    -   `ip` (required): The IP address to check.
-   **Example**: `/api/blockers/crawler?ip=66.249.66.1`

### 7. IP Quality Score (Blockers)
Check the fraud score and quality of an IP address (via IPQualityScore).
-   **Endpoint**: `GET /api/blockers`
-   **Parameters**:
    -   `ip` (required): The IP address to check.
    -   `ua` (optional): User Agent string.
    -   `language` (optional): User language.
-   **Example**: `/api/blockers?ip=1.2.3.4`

### 8. Credit Card Validation
Validate a credit card number using Luhn algorithm and BIN metadata (via Stripe internal API).
-   **Endpoint**: `GET /api/card/validate`
-   **Parameters**:
    -   `card_number` (required): The credit card number.
-   **Example**: `/api/card/validate?card_number=4242424242424242`

### 9. BIN Lookup
Get detailed information about a Bank Identification Number (BIN) (via Neutrino API).
-   **Endpoint**: `GET /api/bin`
-   **Parameters**:
    -   `ccnumb` (required): The first 6 digits of the card (BIN).
    -   `ip` (required): The customer's IP address.
-   **Example**: `/api/bin?ccnumb=424242&ip=1.2.3.4`

## Project Structure

```
beon_api_node/
├── .env                  # Environment variables
├── package.json          # Dependencies
├── data/                 # Data files (GeoIP, denylist)
└── src/
    ├── app.js            # Entry point
    ├── config/           # Database config
    ├── controllers/      # Request handlers
    ├── routes/           # Route definitions
    └── services/         # Business logic
```
