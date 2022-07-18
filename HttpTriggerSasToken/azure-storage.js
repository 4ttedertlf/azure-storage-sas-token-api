const {
    DefaultAzureCredential
} = require('@azure/identity');
const {
    BlobServiceClient,
    BlobSASPermissions,
    generateBlobSASQueryParameters,
    SASProtocol,
    StorageSharedKeyCredential
} = require('@azure/storage-blob');
const logger = require('@azure/logger');
logger.setLogLevel('verbose');

/*
setup:
- iam
- cors

*/

async function createClientFromAccountKey(accountName, accountKey){

    if (!accountName) throw Error('Azure Storage accountName not found');
    if (!accountKey) throw Error('Azure Storage accountKey not found');

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    return blobServiceClient;

}
async function createContainerSas() {

    // Get environment variables
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const containerName = process.env.AZURE_STORAGE_BLOB_CONTAINER_NAME;

    // Best practice: create time limits
    const TEN_MINUTES = 10 * 60 * 1000;
    const NOW = new Date();

    // Best practice: set start time a little before current time to 
    // make sure any clock issues are avoided
    const TEN_MINUTES_BEFORE_NOW = new Date(NOW.valueOf() - TEN_MINUTES);
    const TEN_MINUTES_AFTER_NOW = new Date(NOW.valueOf() + TEN_MINUTES);

    // Best practice: use managed identity - DefaultAzureCredential
    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
      );

    // Best practice: delegation key is time-limited  
    // When using a user delegation key, container must already exist 
    const userDelegationKey = await blobServiceClient.getUserDelegationKey(
        TEN_MINUTES_BEFORE_NOW, 
        TEN_MINUTES_AFTER_NOW
    );

    // Need only list permission to list blobs 
    const containerPermissionsForAnonymousUser = "l";

    // Best practice: SAS options are time-limited
    const sasOptions = {
        containerName,                                           
        permissions: ContainerSASPermissions.parse(containerPermissionsForAnonymousUser), 
        protocol: SASProtocol.HttpsAndHttp,
        startsOn: TEN_MINUTES_BEFORE_NOW,
        expiresOn: TEN_MINUTES_AFTER_NOW
    };
 
    const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        userDelegationKey,
        accountName 
    ).toString();

    return sasToken;
}
async function createStorageBlobContainerSas(accountName, accountKey, containerName, permissions="rcwmsal", timeLimitInMinutes=10) {

    // const blobServiceClient = createClientFromAccountKey(accountName, accountKey)

    // const NOW = new Date();
    // const X_MINUTES_AFTER_NOW = new Date(NOW.valueOf() + timeLimitInMinutes * 60 * 1000);

    // // Best practice: delegation key is time-limited  
    // // When using a user delegation key, container must already exist 
    // const userDelegationKey = await blobServiceClient.getUserDelegationKey(
    //     NOW, 
    //     X_MINUTES_AFTER_NOW
    // );

    // // Best practice: SAS options are time-limited
    // const sasOptions = {
    //     containerName,                                           
    //     permissions: BlobSASPermissions.parse(permissions), 
    //     protocol: SASProtocol.HttpsAndHttp,
    //     startsOn: NOW,
    //     expiresOn: X_MINUTES_AFTER_NOW
    // };
 
    // const sasToken = generateBlobSASQueryParameters(
    //     sasOptions,
    //     userDelegationKey,
    //     accountName 
    // ).toString();

    const sasToken = await createContainerSas();
    return sasToken;
}

module.exports = {
    createStorageBlobContainerSas
}