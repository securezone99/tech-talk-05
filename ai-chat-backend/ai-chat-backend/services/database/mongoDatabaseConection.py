
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables
load_dotenv()


def get_mongo_client():
    host = os.getenv("MONGODB_STRING")
    client = MongoClient(host)
    return client


def get_ali_database():
    client = get_mongo_client()
    db = client[os.getenv("ALI_MONGODB_DATABASE_NAME")]
    return db


def get_gpt_database():
    client = get_mongo_client()
    db = client[os.getenv("MONGODB_DATABASE_NAME")]
    return db
