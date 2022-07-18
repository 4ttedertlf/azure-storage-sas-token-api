const { createStorageBlobContainerSas } = require("./azure-storage");

/*

{"accountName":"4tti","accountKey":"","containerName":"dina","permissions":"raclw","endMinutesFromNow":"10"}

curl -X POST \
  http://localhost:7071/api/HttpTriggerSasToken \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'postman-token: f19ac464-4a3c-c7bb-46f2-8705942398a7' \
  -d '{"accountName":"4tti","accountKey":"","containerName":"dina","permissions":"raclw","endMinutesFromNow":"10"}'


*/

// /api/HttpTriggerSasToken
module.exports = async function (context, req) {
  try {
    context.log("sastoken api entered");

    const body = req.body;

    const accountName =  (body && body.accountName);
    const accountKey = (body && body.accountKey);
    const containerName = (body && body.containerName);
    const permissions = (body && body.permissions);
    const endMinutesFromNow = (body && body.endMinutesFromNow);

    const sasToken = await createStorageBlobContainerSas(
      accountName,
      accountKey,
      containerName,
      permissions,
      endMinutesFromNow
    );

    context.log(`sasToken = ${JSON.stringify(sasToken)}`);

    context.res = {
      body: sasToken,
    };
  } catch (err) {

    context.log(`sasToken = ${JSON.stringify(err)}`);

    context.res = {
      status: 500,
      body: err,
    };
  }
};
