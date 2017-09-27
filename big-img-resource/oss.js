var path = require('path');
var glob = require('glob');

var _ossClient = require('./ossClient');
var co = require('co');

var processArg = process.argv.splice(2),
    arguments = processArg[0];

//console.log('process.argv = ', processArg, filePath, arguments);

if (arguments == undefined) {
    console.log('请带入参数');
    console.log('`all` 或者 `输入需要上传的目录或文件名称`');
} else {

    var fPath = '';
    if (arguments === 'all') {
        fPath = '**';
    } else {
        fPath = '**/' + arguments + '*';
    }
    console.log('lalalla');
    console.log(fPath);
    glob(path.join(__dirname, 'upload/', fPath), {nodir: true}, function (err, files) {
        if (err)
            console.log(err);
        else {
            files.map((file) => {
                co(function*() {
                    yield _ossClient.ossUpload({
                        fileName: file.substring(file.indexOf('upload/') + 7, file.length),
                        path: file
                    });
                });
            });
        }
    });

}
