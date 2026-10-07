import json
import sys
import os
from kafka import KafkaProducer

# Allow importing the Week 1 generator
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "data-generator"))

from generator import generate_transaction


KAFKA_SERVER = "localhost:9092"
TOPIC = "ecommerce-transactions"


producer = KafkaProducer(
    bootstrap_servers=KAFKA_SERVER,
    value_serializer=lambda value: json.dumps(value).encode("utf-8")
)


def send_transactions(number_of_records=100):
    for _ in range(number_of_records):
        transaction = generate_transaction()

        producer.send(TOPIC, value=transaction)

        print(f"Sent: {transaction}")


if __name__ == "__main__":
    send_transactions(100)

    producer.flush()
    producer.close()

    print("Finished sending transactions.")