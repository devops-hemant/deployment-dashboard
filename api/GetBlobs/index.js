const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    const SAS_URL = process.env.AZURE_STORAGE_SAS_URL;

    if (!SAS_URL) {
        context.res = { status: 500, body: "Error: SAS URL missing in Portal Settings." };
        return;
    }

    try {
        // 1. Create the client using the full URL
        const blobServiceClient = new BlobServiceClient(SAS_URL);
        
        // 2. Manually define the container name if the URL parsing is failing
        // Or, use this more robust parsing logic:
        const urlObj = new URL(SAS_URL);
        // This takes the part between '.net/' and the '?'
        const containerName = urlObj.pathname.split('/').filter(Boolean)[0];

        context.log(`Targeting container: ${containerName}`);

        const containerClient = blobServiceClient.getContainerClient(containerName);

        let blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            blobs.push({ name: blob.name });
        }

        context.res = {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: blobs
        };
    } catch (error) {
        // This will now report the specific container it tried to find
        context.res = { 
            status: 500, 
            body: `Storage Error: ${error.message} (Attempted Container: ${SAS_URL.split('.net/')[1]?.split('?')[0]})` 
        };
    }
};