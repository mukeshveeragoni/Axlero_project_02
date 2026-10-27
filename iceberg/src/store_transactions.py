
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

INPUT_FILE = BASE_DIR / "data" / "valid_transactions.jsonl"
OUTPUT_DIR = BASE_DIR / "iceberg" / "data"
OUTPUT_FILE = OUTPUT_DIR / "valid_transactions.parquet"


def store_transactions():
    if not INPUT_FILE.exists():
        print(f"Input file not found: {INPUT_FILE}")
        return

    df = pd.read_json(INPUT_FILE, lines=True)

    if df.empty:
        print("No valid transactions to store.")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_parquet(OUTPUT_FILE, index=False)

    print(f"Transactions stored: {len(df)}")
    print(f"Output file: {OUTPUT_FILE}")
    print(f"Columns: {', '.join(df.columns)}")


if __name__ == "__main__":
    store_transactions()
