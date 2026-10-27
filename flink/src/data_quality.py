
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
QUARANTINE_DIR = BASE_DIR / "quarantine"

VALID_FILE = DATA_DIR / "valid_transactions.jsonl"
QUARANTINE_FILE = QUARANTINE_DIR / "quarantined_transactions.jsonl"

REQUIRED_FIELDS = {
    "order_id",
    "customer_id",
    "product_id",
    "amount",
    "tax_amount",
    "timestamp",
}


def validate_transaction(transaction):
    missing = REQUIRED_FIELDS - transaction.keys()

    if missing:
        return False, f"Missing fields: {', '.join(sorted(missing))}"

    if transaction["tax_amount"] is None:
        return False, "tax_amount is null"

    if not isinstance(transaction["amount"], (int, float)):
        return False, "amount must be numeric"

    if not isinstance(transaction["tax_amount"], (int, float)):
        return False, "tax_amount must be numeric"

    if transaction["amount"] < 0 or transaction["tax_amount"] < 0:
        return False, "amount and tax_amount must be non-negative"

    unexpected = transaction.keys() - REQUIRED_FIELDS
    if unexpected:
        return False, f"Unexpected fields: {', '.join(sorted(unexpected))}"

    return True, "Valid"


def process_file(input_file):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)

    valid_count = 0
    quarantined_count = 0

    with open(input_file, "r", encoding="utf-8") as source, \
         open(VALID_FILE, "w", encoding="utf-8") as valid_output, \
         open(QUARANTINE_FILE, "w", encoding="utf-8") as quarantine_output:

        for line_number, line in enumerate(source, start=1):
            if not line.strip():
                continue

            try:
                transaction = json.loads(line)
                if not isinstance(transaction, dict):
                    raise ValueError("Transaction must be a JSON object")

                is_valid, reason = validate_transaction(transaction)

                if is_valid:
                    valid_output.write(json.dumps(transaction) + "\n")
                    valid_count += 1
                else:
                    record = {
                        "line_number": line_number,
                        "reason": reason,
                        "transaction": transaction,
                    }
                    quarantine_output.write(json.dumps(record) + "\n")
                    quarantined_count += 1

            except (json.JSONDecodeError, ValueError) as error:
                record = {
                    "line_number": line_number,
                    "reason": str(error),
                    "raw_record": line.rstrip("\n"),
                }
                quarantine_output.write(json.dumps(record) + "\n")
                quarantined_count += 1

    print(f"Valid transactions: {valid_count}")
    print(f"Quarantined transactions: {quarantined_count}")
    print(f"Valid output: {VALID_FILE}")
    print(f"Quarantine output: {QUARANTINE_FILE}")


if __name__ == "__main__":
    sample_file = DATA_DIR / "sample_transactions.jsonl"

    if not sample_file.exists():
        print(f"Input file not found: {sample_file}")
        print("Create the sample file before running this processor.")
    else:
        process_file(sample_file)
