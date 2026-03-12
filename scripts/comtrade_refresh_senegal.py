from datetime import date
import json
import os
from pathlib import Path

import comtradeapicall


def main() -> None:
  subscription_key = os.getenv("COMTRADE_API_KEY", "").strip()
  if not subscription_key:
    raise RuntimeError("Missing COMTRADE_API_KEY environment variable")

  out_dir = Path("src/data/comtrade")
  out_dir.mkdir(parents=True, exist_ok=True)
  out_file = out_dir / "senegal_trade_latest.json"

  current_year = date.today().year
  # Try current year then previous years.
  candidate_years = [current_year, current_year - 1, current_year - 2]

  payload = {
    "country": "SEN",
    "reporterCode": "686",
    "generatedAt": date.today().isoformat(),
    "source": "UN Comtrade via comtradeapicall",
    "annual": [],
  }

  for year in candidate_years:
    period = str(year)
    try:
      df = comtradeapicall.getFinalData(
        subscription_key,
        typeCode="C",
        freqCode="A",
        clCode="HS",
        period=period,
        reporterCode="686",
        cmdCode="TOTAL",
        flowCode="M,X",
        partnerCode="0",
        partner2Code=None,
        customsCode=None,
        motCode=None,
        maxRecords=2500,
        format_output="JSON",
        aggregateBy=None,
        breakdownMode="classic",
        countOnly=None,
        includeDesc=True,
      )
      if df is None or df.empty:
        continue

      exports_val = 0.0
      imports_val = 0.0
      for _, row in df.iterrows():
        flow = str(row.get("flowCode", "")).upper()
        value = float(row.get("primaryValue", 0) or 0)
        if flow == "X":
          exports_val += value
        elif flow == "M":
          imports_val += value

      payload["annual"].append({
        "year": year,
        "exportsUsd": exports_val,
        "importsUsd": imports_val,
        "balanceUsd": exports_val - imports_val,
      })
    except Exception:
      continue

  with out_file.open("w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

  print(f"Wrote {out_file}")


if __name__ == "__main__":
  main()

