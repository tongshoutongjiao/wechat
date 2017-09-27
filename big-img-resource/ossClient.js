var fs = require('fs');

var co = require('co');
var OSS = require('ali-oss');

var client = new OSS({
    region: 'oss-cn-sud',
    accessKeyId: 'LTAIbQnqC0C5wf5P',
    accessKeySecret: '0wUnokaNtBTp4PaG7wHpOxsqozkqBQ',
    bucket: 'deepfashion'
});


// oss 上传文件
function ossUpload(obj) {
    if (!obj) return ' 输入文件夹';
    return function () {
        console.log('obj');
        console.log(obj);

        co(function* () {
            var stream = fs.createReadStream(obj.path);

            console.log('stream');
            console.log(stream);


            yield client.putBucketACL('deepfashion', 'oss-cn-hangzhou', 'public-read');
            var result = yield client.putStream(obj.fileName, stream);

            if (result.res.status === 200) {
                console.log('OSS上传文件 成功', result.url);
            }
        }).catch(function (err) {
            console.log('ossUpload error', err);
        });

    }
}

exports.ossUpload = ossUpload;