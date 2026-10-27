
import json
import sys
from pathlib import Path
from kafka import KafkaConsumer

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
QUARANTINE_DIR = BASE_DIR / "quarantine"

DATA_DIR.mkdir(parents=True, exist_ok=True)
QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)

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


def main():
    consumer = KafkaConsumer(
        "ecommerce-transactions",
        bootstrap_servers=["localhost:9092"],
        value_deserializer=lambda value: json.loads(value.decode("utf-8")),
        group_id="icestream-quality-processor-v1",
        auto_offset_reset="earliest",
        consumer_timeout_ms=10000,
    )

    valid_count = 0
    quarantined_count = 0

    try:
        with open(VALID_FILE, "a", encoding="utf-8") as valid_output, \
             open(QUARANTINE_FILE, "a", encoding="utf-8") as quarantine_output:

            print("Reading Kafka transactions for up to 10 seconds...")

            for message in consumer:
                transaction = message.value

                if not isinstance(transaction, dict):
                    quarantine_output.write(json.dumps({
                        "reason": "Transaction must be a JSON object",
                        "raw_record": transaction,
                    }) + "\n")
                    quarantined_count += 1
                    continue

                is_valid, reason = validate_transaction(transaction)

                if is_valid:
                    valid_output.write(json.dumps(transaction) + "\n")
                    valid_count += 1
                else:
                    quarantine_output.write(json.dumps({
                        "reason": reason,
                        "transaction": transaction,
                    }) + "\n")
                    quarantined_count += 1

        print(f"Valid Kafka transactions: {valid_count}")
        print(f"Quarantined Kafka transactions: {quarantined_count}")

    finally:
        consumer.close()


if __name__ == "__main__":
    main()
