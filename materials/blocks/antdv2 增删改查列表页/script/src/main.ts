import * as path from 'path';
import { window, workspace } from 'vscode';
import * as fs from 'fs-extra';
import * as execa from 'execa';
import * as ejs from 'ejs';
import axios from 'axios';
import { translate } from '@share/TypeChatSlim/index';
import { generalBasic } from '@share/BaiduOCR/index';
import { typescriptToMock } from '@share/utils/json';
import { context } from './context';
import { PageConfig } from '../../config/schema';

export async function handleOCR() {
  const { lowcodeContext } = context;
  if (!lowcodeContext?.clipboardImage) {
    window.showInformationMessage('剪贴板里没有截图');
    return {
      updateModelImmediately: false,
      onlyUpdateParams: true,
      params: '',
      model: lowcodeContext?.model,
    };
  }
  const ocrRes = await generalBasic({ image: lowcodeContext!.clipboardImage! });
  return {
    updateModelImmediately: false,
    onlyUpdateParams: true,
    params: ocrRes.words_result.map((s) => s.words).join('\r\n'),
    model: lowcodeContext?.model,
  };
}

export async function handleInitFiltersFromImage() {
  const { lowcodeContext } = context;
  if (!lowcodeContext?.clipboardImage) {
    window.showInformationMessage('剪贴板里没有截图');
    return lowcodeContext?.model;
  }
  const ocrRes = await generalBasic({ image: lowcodeContext!.clipboardImage! });
  const filters = ocrRes.words_result.map((s) => s.words);
  const formatedFilters = filters.map((item) => {
    const s = item.replace(/：|：/g, ':').split(':');
    return {
      component: (s[1] || '').indexOf('选择') > -1 ? 'select' : 'input',
      key: s[0].replace(/:|：/g, '').trim(),
      label: s[0].replace(/:|：/g, '').trim(),
      placeholder: s[1],
    };
  });
  return {
    updateModelImmediately: false,
    onlyUpdateParams: false,
    params: '',
    model: { ...lowcodeContext.model, filters: formatedFilters },
  };
}

export async function handleInitColumnsFromImage() {
  const { lowcodeContext } = context;
  if (!lowcodeContext?.clipboardImage) {
    window.showInformationMessage('剪贴板里没有截图');
    return lowcodeContext?.model;
  }
  const ocrRes = await generalBasic({ image: lowcodeContext!.clipboardImage! });
  const columns = ocrRes.words_result.map((s) => ({
    slot: false,
    title: s.words,
    dataIndex: s.words,
    key: s.words,
  }));
  return {
    updateModelImmediately: false,
    onlyUpdateParams: false,
    params: '',
    model: { ...lowcodeContext.model, columns },
  };
}

export async function handleAskChatGPT() {
  const { lowcodeContext } = context;
  const schema = fs.readFileSync(
    path.join(lowcodeContext!.materialPath, 'config/schema.ts'),
    'utf8',
  );
  const typeName = 'PageConfig';
  const res = await translate<PageConfig>({
    schema,
    typeName,
    request: JSON.stringify(lowcodeContext!.model as PageConfig),
    completePrompt:
      `你是一个根据以下 TypeScript 类型定义将用户请求转换为 "${typeName}" 类型的 JSON 对象的服务，并且按照字段的注释进行处理:\n` +
      `\`\`\`\n${schema}\`\`\`\n` +
      `以下是用户请求:\n` +
      `"""\n${JSON.stringify(lowcodeContext!.model as PageConfig)}\n"""\n` +
      `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`,
    createChatCompletion: lowcodeContext!.createChatCompletion,
    showWebview: true,
    extendValidate: (jsonObject) => ({ success: true, data: jsonObject }),
  });
  lowcodeContext!.outputChannel.appendLine(JSON.stringify(res, null, 2));
  if (res.success) {
    return {
      updateModelImmediately: false,
      onlyUpdateParams: false,
      params: '',
      model: { ...res.data },
    };
  }
  return lowcodeContext!.model;
}

export async function handleComplete() {
  const { lowcodeContext } = context;
  const createBlockPath = context.lowcodeContext?.createBlockPath;
  if (createBlockPath) {
    // #region 更新 mock 服务
    const mockType = fs
      .readFileSync(path.join(createBlockPath, 'temp.mock.type').toString())
      .toString();
    fs.removeSync(path.join(createBlockPath, 'temp.mock.type'));
    const { mockCode, mockData } = typescriptToMock(mockType);
    const mockTemplate = fs
      .readFileSync(
        path.join(createBlockPath, 'temp.mock.script.ejs').toString(),
      )
      .toString();
    fs.removeSync(path.join(createBlockPath, 'temp.mock.script.ejs'));
    // @ts-ignore
    if (!lowcodeContext?.model.includeModifyModal) {
      fs.removeSync(path.join(path.join(createBlockPath, 'ModifyModal')));
    }
    const mockScript = ejs.render(mockTemplate, {
      ...lowcodeContext!.model,
      mockCode,
      mockData,
      createBlockPath: createBlockPath.replace(':', ''),
    });
    const mockProjectPathRes = await axios
      .get('http://localhost:3000/mockProjectPath', { timeout: 1000 })
      .catch(() => {
        // window.showInformationMessage(
        //   '获取 mock 项目路径失败，跳过更新 mock 服务',
        // );
      });
    if (mockProjectPathRes?.data.result) {
      const projectName = workspace.rootPath
        ?.replace(/\\/g, '/')
        .split('/')
        .pop();
      const mockRouteFile = path.join(
        mockProjectPathRes.data.result,
        `${projectName}.js`,
      );
      let mockFileContent = `
			import KoaRouter from 'koa-router';
			import proxy from '../middleware/Proxy';
			import { delay } from '../lib/util';

			const Mock = require('mockjs');

			const { Random } = Mock;

			const router = new KoaRouter();
			router{{mockScript}}
			module.exports = router;
			`;

      if (fs.existsSync(mockRouteFile)) {
        mockFileContent = fs.readFileSync(mockRouteFile).toString().toString();
        const index = mockFileContent.lastIndexOf(')') + 1;
        mockFileContent = `${mockFileContent.substring(
          0,
          index,
        )}{{mockScript}}\n${mockFileContent.substring(index)}`;
      }
      mockFileContent = mockFileContent.replace(/{{mockScript}}/g, mockScript);
      fs.writeFileSync(mockRouteFile, mockFileContent);
      try {
        execa.sync('node', [
          path.join(
            mockProjectPathRes.data.result
              .replace(/\\/g, '/')
              .replace('/src/routes', ''),
            '/node_modules/eslint/bin/eslint.js',
          ),
          mockRouteFile,
          '--resolve-plugins-relative-to',
          mockProjectPathRes.data.result
            .replace(/\\/g, '/')
            .replace('/src/routes', ''),
          '--fix',
        ]);
      } catch (err) {
        console.log(err);
      }
      // #endregion
    }
  }
}
