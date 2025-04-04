# DNS Lookup Application

Simple web application for looking up DNS records and WHOIS information about domains.

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

### Local Development
```bash
npm start
```

### Docker
```bash
docker build -t domain-lookup .
docker run -p 3000:3000 domain-lookup
```

## Usage

1. Open browser at `http://localhost:3000`
2. Enter domain in the search field
3. Click "Search"
4. View results:
   - A records (IP addresses)
   - NS records (nameservers)
   - MX records (mail servers)
   - TXT records
   - WHOIS information

## Features

- DNS record lookup
- WHOIS information for each IP address
- Hosting provider identification
- Responsive design with Bootstrap
- Docker support 