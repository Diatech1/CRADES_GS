# CRADES Data Sources Integration

This document describes the real-world data sources integrated into CRADES and how to use them.

## Overview

CRADES pulls data from multiple authoritative sources:

1. **ANSD** (Senegal's National Statistics Agency)
2. **World Bank** APIs
3. **Senegal Government Ministries**
4. **WITS** (World Integrated Trade Solution)
5. **WordPress** (CMS content)

---

## Available Data Sources

### 1. ANSD (Agence Nationale de la Statistique et de la Démographie)

Senegal's official statistics agency providing macroeconomic indicators.

#### Endpoints

| Endpoint | Description | Query Parameters |
|----------|-------------|------------------|
| `GET /api/ansd/macro-indicators` | GDP, inflation, unemployment, debt, revenue | — |
| `GET /api/ansd/industrial-index` | Industrial Production Index (IPI) | `year`, `sector` |
| `GET /api/ansd/inflation` | Consumer Price Index (CPI) | `months` (default: 12) |
| `GET /api/ansd/employment` | Employment statistics by sector | `sector` |

#### Cloudflare Fallback (Browser Methodology)

If ANSD responds with a Cloudflare challenge (`403`/HTML challenge page), backend endpoints can
fallback to an external real-browser fetch service.

Environment variables:

- `ANSD_BROWSER_FETCH_URL` (example: `http://127.0.0.1:8799/fetch`)
- `ANSD_BROWSER_FETCH_TOKEN` (optional bearer token)

Execution flow:

1. Backend tries direct ANSD fetch.
2. If Cloudflare challenge is detected, backend calls the browser fetcher URL.
3. Browser fetcher returns JSON.
4. Backend applies normal transform + cache and responds to dashboards.

Example browser fetcher:

- `scripts/ansd_browser_fetcher_example.py`

#### Example Requests

```bash
# Get macro indicators
curl http://localhost:5173/api/ansd/macro-indicators

# Get industrial index for 2025
curl http://localhost:5173/api/ansd/industrial-index?year=2025

# Get 24 months of inflation data
curl http://localhost:5173/api/ansd/inflation?months=24

# Get manufacturing employment
curl http://localhost:5173/api/ansd/employment?sector=Manufacturing
```

#### Sample Response

```json
{
  "indicators": [
    {
      "code": "GDP_REAL",
      "name": "Real GDP Growth",
      "nameFr": "Croissance du PIB réel",
      "value": 5.2,
      "unit": "%",
      "period": "2026 Q1",
      "source": "ANSD",
      "lastUpdated": "2026-03-02T00:00:00.000Z"
    }
  ],
  "source": "ANSD (Senegal)"
}
```

---

### 2. World Bank Indicators API

Development indicators from the World Bank for Senegal.

#### Endpoints

| Endpoint | Description | Query Parameters |
|----------|-------------|------------------|
| `GET /api/worldbank/country` | Country information | — |
| `GET /api/worldbank/indicators` | Key development indicators | `year` |
| `GET /api/worldbank/indicator/:code` | Specific indicator time series | `startYear`, `endYear` |

#### Common Indicator Codes

- `NY.GDP.MKTP.CD` — GDP (current US$)
- `NY.GDP.MKTP.KD.ZG` — GDP growth (annual %)
- `NY.GNP.PCAP.CD` — GNI per capita
- `NE.EXP.GNFS.CD` — Exports
- `NE.IMP.GNFS.CD` — Imports
- `BX.KLT.DINV.CD.WD` — FDI inflows
- `NV.IND.MANF.CD` — Manufacturing value added

#### Example Requests

```bash
# Get country info
curl http://localhost:5173/api/worldbank/country

# Get all indicators for 2024
curl http://localhost:5173/api/worldbank/indicators?year=2024

# Get GDP growth time series (2015-2025)
curl http://localhost:5173/api/worldbank/indicator/NY.GDP.MKTP.KD.ZG?startYear=2015&endYear=2025
```

#### Sample Response

```json
{
  "country": {
    "name": "Senegal",
    "region": "Sub-Saharan Africa",
    "incomeLevel": "Lower middle income",
    "lendingType": "IBRD"
  },
  "source": "World Bank"
}
```

---

### 3. Ministry of Commerce

Data on domestic and foreign trade.

#### Endpoints

| Endpoint | Description | Query Parameters |
|----------|-------------|------------------|
| `GET /api/ministry/commerce` | Trade data | `type` (foreign\|domestic) |
| `GET /api/ministry/sector/commerce-exterieur` | Foreign trade | — |
| `GET /api/ministry/sector/commerce-interieur` | Domestic trade | — |

#### Sample Data

Returns trade data by product and partner country with values, shares, and trends.

```bash
curl http://localhost:5173/api/ministry/commerce?type=foreign
curl http://localhost:5173/api/ministry/commerce?type=domestic
```

---

### 4. Ministry of Industry & SMEs

Industrial sector and small/medium enterprise data.

#### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/ministry/industry` | SME registrations, factory counts, output |
| `GET /api/ministry/sector/industrie` | Manufacturing sector data |

#### Sample Response

```json
{
  "industry": {
    "registeredSMEs": 47832,
    "activeFactories": 2847,
    "industrialOutput": 2847000000000,
    "capacityUtilization": 68.3,
    "employees": 234500,
    "byRegion": [...],
    "bySubsector": [...]
  }
}
```

---


### 7. WITS Trade Data (World Bank)

Detailed trade statistics by product and partner.

#### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/trade/overview` | Trade summary (exports, imports, balance) |
| `GET /api/trade/timeseries` | Historical trade data |
| `GET /api/trade/sectors` | Trade by product sector |
| `GET /api/trade/partners/exports` | Top export destinations |
| `GET /api/trade/partners/imports` | Top import origins |
| `GET /api/trade/dashboard` | Complete trade dashboard |

---

### 8. UNIDO Statistics Portal

Global industrial and manufacturing data from UNIDO’s redesigned portal.

#### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/unido/dataset/:name` | Retrieve dataset metadata (country list, variables, activities, datasetId) |
| `POST /api/unido/dataWithoutActivities` | Fetch data for datasets that don’t use ISIC activities | 
| `POST /api/unido/dataWithActivities` | Fetch data for activity‑based datasets (INDSTAT, IDSB, IIP, etc.) |

#### Usage Notes

1. **Dataset metadata** – call the GET endpoint with a database name such as `CIP`, `INDSTAT/4`, `MTD`, etc. The response contains a `datasetId` which must be passed in subsequent data requests.
2. **Data requests** – build a JSON body with `datasetId`, `countryCode`, `variableCodes`, `periods`, and optionally `activities`.
3. **Cloudflare challenges** – basic `fetch` may return 403. If so you’ll need a headful browser (see instructions in the UNIDO API client source). 

Example metadata request:

```bash
curl http://localhost:5173/api/unido/dataset/CIP
```

Example data request (without activities):

```bash
curl -X POST http://localhost:5173/api/unido/dataWithoutActivities \
  -H "Content-Type: application/json" \
  -d '{
    "datasetId": "<id-from-metadata>",
    "countryCode": "SEN",
    "fullPrecision": true,
    "variableCodes": ["cip","cipRank", "MVApc"],
    "periods": ["2018","2019","2020"]
  }'
```

> Remember: calls are per‑country; loop over country codes if you need multi‑country data.


## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│              Frontend (React/CRADES UI)                 │
└────────────────────────┬────────────────────────────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
   ┌────────▼──────┐  ┌──▼──────┐  ┌─▼──────────┐
   │  Vite Dev     │  │  Hono   │  │ WordPress  │
   │  Server       │  │  API    │  │  REST API  │
   │ (localhost)   │  │ Routes  │  │            │
   └────────┬──────┘  └──┬──────┘  └─┬──────────┘
            │            │            │
     ┌──────▴────────────┼────────────┴──────┐
     │                   │                    │
  ┌──▼───┐  ┌──────────┐ │ ┌──────────────┐ │
  │ ANSD │  │ Ministry │ │ │ World Bank   │ │
  │ APIs │  │   APIs   │ │ │ APIs (wb.org)│ │
  │      │  │          │ │ │              │ │
  │Cache │  │ Cache    │ │ │ Cache (24h)  │ │
  │(24h) │  │ (24h)    │ │ │              │ │
  └──────┘  └──────────┘ │ └──────────────┘ │
                         │                   │
                         └───────────────────┘
```

---

## Implementation Details

### Caching Strategy

All APIs implement in-memory caching to reduce external requests:

- **24-hour TTL** for statistical data (ANSD, World Bank, Ministries)
- **60-second TTL** for WordPress content
- Cache is stored in-memory per edge worker instance

### Error Handling

All endpoints implement graceful fallbacks:

1. Try to fetch from real API
2. If API unavailable, return cached data
3. If no cache, return realistic sample data

This ensures the UI always has data to display, even during API outages.

### Adding New Data Sources

To add a new data source:

1. Create a new utility file in `src/utils/` (e.g., `src/utils/new-api.ts`)
2. Implement data fetching functions with caching
3. Add imports to `src/api/routes.ts`
4. Add route handlers for new endpoints
5. Test with `npm run dev`

---

## Connecting to Real APIs

### ANSD

If ANSD exposes a public API, update the base URL in `src/utils/ansd-api.ts`:

```typescript
const ANSD_BASE = 'https://www.ansd.sn/api'
```

### Ministry APIs

To connect ministry APIs, update endpoints in `src/utils/ministry-api.ts`:

```typescript
const MINISTRY_APIS = {
  commerce: 'https://api.commerce.sn',
  industry: 'https://api.industrie.sn',
  energy: 'https://api.energie.sn',
  agriculture: 'https://api.agriculture.sn',
}
```

### World Bank

The World Bank API is already functional and no authentication is required.

---

## Testing

Test endpoints locally:

```bash
# Development server
npm run dev

# In another terminal, test API endpoints
curl http://localhost:5173/api/ansd/macro-indicators
curl http://localhost:5173/api/worldbank/indicators
curl http://localhost:5173/api/ministry/industry
```

---

## Security Notes

- All APIs use public endpoints (no sensitive credentials)
- CORS is handled via Hono middleware
- API responses are cached to reduce external requests
- Rate limiting is recommended for production

---

## References

- [World Bank API Documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/889386)
- [WITS Trade Data](https://wits.worldbank.org/)
- [Senegal ANSD](https://www.ansd.sn/)
- [African Development Bank](https://www.afdb.org/)
