import os
import re
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient

def initialize_blob_service():
    account_name = os.getenv('STORAGE_ACCOUNT_NAME')
    credential = DefaultAzureCredential()
    blob_service_client = BlobServiceClient(account_url=f"https://{account_name}.blob.core.windows.net", credential=credential)
    return blob_service_client

def sanitize_container_name(name):
    sanitized = re.sub(r'[^a-z0-9-]', '-', name.lower())
    return sanitized[:63]

def create_user_containers(user_id):
    blob_service_client = initialize_blob_service()
    ingestion_container_name = sanitize_container_name(f"{user_id}-ingestion")
    reference_container_name = sanitize_container_name(f"{user_id}-reference")
    
    new_ingestion_container_created = False
    try:
        blob_service_client.create_container(ingestion_container_name)
        new_ingestion_container_created = True
    except Exception as e:
        print(f"Ingestion container already exists: {e}")
    
    try:
        blob_service_client.create_container(reference_container_name)
    except Exception as e:
        print(f"Reference container already exists: {e}")
    
    return ingestion_container_name, reference_container_name, new_ingestion_container_created

def upload_files_to_blob(container_name, file_paths):
    blob_service_client = initialize_blob_service()
    container_client = blob_service_client.get_container_client(container_name)
    for file_path in file_paths:
        blob_path = os.path.basename(file_path)
        with open(file_path, "rb") as data:
            container_client.upload_blob(name=blob_path, data=data, overwrite=True)
