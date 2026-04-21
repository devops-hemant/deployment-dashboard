const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    const SAS_URL = process.env.AZURE_STORAGE_SAS_URL;

    // Check if secret exists
    if (!SAS_URL) {
        context.res = { status: 500, body: "Error: SAS URL is missing in Azure Portal Settings." };
        return;
    }

    try {
        const blobServiceClient = new BlobServiceClient(SAS_URL);
        
        // Robust container name extraction
        const urlObj = new URL(SAS_URL);
        const containerName = urlObj.pathname.split('/').filter(Boolean)[0];
        
        const containerClient = blobServiceClient.getContainerClient(containerName);

        let blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            blobs.push({ name: blob.name });
        }

        context.res = { status: 200, body: blobs };
    } catch (error) {
        // This sends the actual Azure error back to your 'Error loading data' logic
        context.res = { 
            status: 500, 
            body: `Azure Error: ${error.message}` 
        };
    }
};