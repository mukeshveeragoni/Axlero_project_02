import random
import json
import time
from datetime import datetime


def generate_transaction():
    transaction = {
        "order_id": random.randint(100000, 999999),
        "customer_id": random.randint(1000, 9999),
        "product_id": random.randint(100, 999),
        "amount": round(random.uniform(100, 5000), 2),
        "tax_amount": round(random.uniform(10, 500), 2),
        "timestamp": datetime.now().isoformat()
    }

    # Inject NULL value in approximately 5% of transactions
    if random.random() < 0.05:
        transaction["tax_amount"] = None

    # Inject schema change in approximately 2% of transactions
    if random.random() < 0.02:
        transaction["discount_amount"] = round(random.uniform(0, 500), 2)

    return transaction


def generate_stream(number_of_records=100):
    for _ in range(number_of_records):
        transaction = generate_transaction()
        # print(transaction)
        print(json.dumps(transaction))
        time.sleep(0.1)


if __name__ == "__main__":
    generate_stream(100)