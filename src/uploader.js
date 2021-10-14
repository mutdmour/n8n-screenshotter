const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

AWS.config.update({region: 'us-east-1'});

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const deleteFile = (file) => {
	try {
		fs.unlinkSync(file)
	} catch(err) {
		console.error(err)
	}
}

module.exports = {
	upload(file) {
		return new Promise((resolve, reject) => {
			const uploadParams = {Bucket: 'n8n-snapshots', Key: '', Body: ''};

			const fileStream = fs.createReadStream(file);
			fileStream.on('error', function(err) {
				reject(err);
			});

			uploadParams.Body = fileStream;
			uploadParams.Key = path.basename(file);

			s3.upload (uploadParams, function (err, data) {
				if (err) {
					reject(err);
				} if (data) {
					resolve(data);
				}

				setTimeout(() => {
					deleteFile(file);
				}, 0);
			});
		});
	},
};
