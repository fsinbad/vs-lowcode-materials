const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAlias(
  '@share',
  path.join(__dirname.split('materials')[0], 'dist/share'),
);
const main = require('../../../../dist/materials/snippets/axios-request/script/src/main');
const {
  context,
} = require('../../../../dist/materials/snippets/axios-request/script/src/context');

module.exports = {
  beforeCompile: (context) => {},
  afterCompile: (constext) => {},
};
