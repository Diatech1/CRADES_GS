# Comtrade Setup (Python + API Key)

## 1) Install package

```powershell
py -m pip install comtradeapicall
py -m pip install --upgrade comtradeapicall
```

## 2) Set API key

```powershell
$env:COMTRADE_API_KEY="<YOUR KEY>"
```

## 3) Refresh Senegal snapshot

```powershell
py scripts/comtrade_refresh_senegal.py
```

Output file:

- `src/data/comtrade/senegal_trade_latest.json`

## 4) Runtime behavior in this app

- If `COMTRADE_API_KEY` is configured, backend tries Comtrade annual totals first.
- If Comtrade is unavailable, backend falls back to WITS.
- Public releases are always available on:
  - `GET /api/comtrade/releases`

