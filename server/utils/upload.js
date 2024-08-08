const { s3, s3_bucket } = require("../config/s3");

const getSignedUrl = (params) => {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const uploadAudio = async (req, res) => {
  const fileName = req.body.fileName;
  const fileType = req.body.fileType;

  const s3Params = {
    Bucket: s3_bucket,
    Key: fileName,
    Expires: 3000,
    ContentType: fileType,
    ACL: 'public-read'
  };

  try {
    const data = await getSignedUrl(s3Params);
    const returnData = {
      signedRequest: data,
      url: `https://${s3_bucket}.s3.amazonaws.com/${fileName}`
    };
    res.status(200).json({ data: { returnData } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

module.exports = { uploadAudio };
