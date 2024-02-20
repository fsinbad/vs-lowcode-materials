"use strict";
require('ts-node').register({
    transpileOnly: true,
    typeCheck: false,
    emit: false,
    compilerHost: false,
    cwd: __dirname, // 要输出编译后代码必须配置，否则会报错 EROFS: read-only file system, mkdir '/.ts-node'。不输出也要配置不然会出现各种奇奇怪怪的报错
});
// 清除缓存，保证每次修改代码后实时生效，否则要重新打开 vscode
const { clearCache } = require('../../../../share/clearCache.ts');
clearCache(__dirname); // 调试的时候才打开，不然会很慢
const main = require('./src/main.ts');
const { context } = require('./src/context.ts');
module.exports = {
    beforeCompile: (lowcodeContext) => { },
    afterCompile: (lowcodeContext) => { },
    complete: (lowcodeContext) => {
        context.lowcodeContext = lowcodeContext;
        main.handleComplete();
    },
    initFromOcrText: (lowcodeContext) => {
        let items = lowcodeContext.params.split('\n');
        items = items.map((s) => ({
            key: s.split(/:|：/g)[0],
            label: s.split(/:|：/g)[0],
        }));
        return { ...lowcodeContext.model, items };
    },
    askChatGPT: async (lowcodeContext) => {
        const statusBarItem = lowcodeContext.vscode.window.createStatusBarItem(lowcodeContext.vscode.StatusBarAlignment.Left);
        statusBarItem.text = '$(sync~spin) Ask ChatGPT...';
        statusBarItem.show();
        const res = await lowcodeContext.createChatCompletion({
            messages: [
                {
                    role: 'system',
                    content: `你是一个严谨的代码机器人，严格按照用户的要求处理问题`,
                },
                {
                    role: 'user',
                    content: `${JSON.stringify(lowcodeContext.model)} 将这段 JSON 中 items 字段里的 key 字段的值翻译成英文，驼峰格式，返回翻译后的JSON，不要带其他无关的内容，并且返回的结果使用 JSON.parse 不会报错`,
                },
            ],
            handleChunk: (data) => {
                lowcodeContext.outputChannel.append(data.text || '');
            },
        });
        statusBarItem.hide();
        statusBarItem.dispose();
        lowcodeContext.outputChannel.appendLine(res);
        return { ...lowcodeContext.model, ...JSON.parse(res) };
    },
};
