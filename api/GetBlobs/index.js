const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
    // You will set this variable in the Azure Portal
    const SAS_URL = process.env.AZURE_STORAGE_SAS_URL;

    try {
        const blobServiceClient = new BlobServiceClient(SAS_URL);
        const containerName = urlToContainerName(SAS_URL);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        let blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            blobs.push({ name: blob.name });
        }

        context.res = {
            status: 200,
            body: blobs
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: `Error: ${error.message}`
        };
    }
};

function urlToContainerName(url) {
    const parts = new URL(url).pathname.split('/');
    return parts[parts.length - 1] || parts[parts.length - 2];
}