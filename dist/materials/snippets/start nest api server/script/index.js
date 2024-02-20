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
delete require.cache[require.resolve(path.join(__dirname, './src/main.ts'))];
const main = require('./src/main.ts');
const { context } = require('./src/context.ts');
module.exports = {
    beforeCompile: (lowcodeContext) => {
        lowcodeContext.outputChannel.appendLine('compile start nest api srver start');
    },
    afterCompile: (lowcodeContext) => {
        lowcodeContext.outputChannel.appendLine('compile start nest api srver end');
    },
    test: (lowcodeContext) => {
        lowcodeContext.outputChannel.appendLine(Object.keys(lowcodeContext));
        lowcodeContext.outputChannel.appendLine(JSON.stringify(lowcodeContext.model));
        lowcodeContext.outputChannel.appendLine(lowcodeContext.params);
        return { ...lowcodeContext.model, name: '测试一下' };
    },
    onSelect: async (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        await main.bootstrap();
    },
};
