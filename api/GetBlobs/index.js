const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    const SAS_URL = process.env.AZURE_STORAGE_SAS_URL;

    if (!SAS_URL) {
        context.res = { status: 500, body: "Error: SAS URL missing in Portal Settings." };
        return;
    }

    try {
        const blobServiceClient = new BlobServiceClient(SAS_URL);
        
        // This regex extracts the container name even if it's $web
        const containerName = SAS_URL.split('.net/')[1].split('?')[0];
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
        context.res = { status: 500, body: `Storage Error: ${error.message}` };
    }
};