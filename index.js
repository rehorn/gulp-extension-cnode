var path = require('path');
var fs = require('fs');

var through = require('through2');
var gutil = require('gulp-util');

var cnode = require('extension-cnode');

module.exports = function(options) {

    options = options || {};
    options.CNODE_KEY = options.CNODE_KEY || 'fD*Sf4YF2^$%';

    cnode.setKey(options.CNODE_KEY);

    var basePath, mainPath, mainName, extName, pathName;

    function createFile(name, content) {
        return new gutil.File({
            path: path.join(path.relative(basePath, mainPath), gutil.replaceExtension(name, '.cnode')),
            contents: new Buffer(content)
        });
    };

    function process(content, push, callback) {
        var result = cnode.pack(content);
        var file = createFile(mainName, result);
        push(file);
        callback();
    };

    return through.obj(function(file, enc, callback) {
        if (file.isNull()) {
            this.push(file); // Do nothing if no contents
            callback();
        } else if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-extension-cnode', 'Streams are not supported!'));
            callback();
        } else {
            basePath = file.base;
            mainPath = path.dirname(file.path);
            mainName = path.basename(file.path);
            extName = path.extname(file.path);
            pathName = file.path;

            process(String(file.contents), this.push.bind(this), callback);
        }
    });
};
