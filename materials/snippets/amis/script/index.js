const main = require('../../../../dist/materials/snippets/amis/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/amis/script/src/context');

module.exports = {
  beforeCompile: (context) => {
    context.outputChannel.appendLine('compile amis start');
  },
  afterCompile: (context) => {
    context.outputChannel.appendLine('compile amis end');
  },
  test: (context) => {
    context.outputChannel.appendLine(Object.keys(context));
    context.outputChannel.appendLine(JSON.stringify(context.model));
    context.outputChannel.appendLine(context.params);
    return { ...context.model, name: '测试一下' };
  },
};
