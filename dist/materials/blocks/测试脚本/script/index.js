"use strict";
require('ts-node').register({
    transpileOnly: true,
    typeCheck: false,
    emit: false,
    compilerHost: false,
    cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});
const path = require('path');
// 清除缓存，保证每次修改代码后实时生效
delete require.cache[require.resolve(path.join(__dirname, 'handle.ts'))];
const Handler = require('./handle.ts');
module.exports = {
    beforeCompile: (context) => {
        const compileHandler = new Handler.CompileHandler3c5a281f3af548fda73cb864dd8f452b(context);
        compileHandler.log('compile start');
    },
    afterCompile: (context) => {
        const compileHandler = new Handler.CompileHandler3c5a281f3af548fda73cb864dd8f452b(context);
        compileHandler.log('compile end');
    },
    complete: (context) => {
        const compileHandler = new Handler.CompileHandler3c5a281f3af548fda73cb864dd8f452b(context);
        compileHandler.log('compile complete');
    },
    intFromOcrText: (context) => {
        const viewCallHandler = new Handler.ViewCallHandler3c5a281f3af548fda73cb864dd8f452b(context);
        viewCallHandler.log('call method intFromOcrText');
        viewCallHandler.showInformationMessage('lowcode');
        return viewCallHandler.intFromOcrText();
    },
    askChatGPT: (context) => {
        const viewCallHandler = new Handler.ViewCallHandler3c5a281f3af548fda73cb864dd8f452b(context);
        viewCallHandler.log('call method askChatGPT');
        return viewCallHandler.askChatGPT();
    },
};
