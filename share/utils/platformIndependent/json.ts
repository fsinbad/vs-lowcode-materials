import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as TJS from 'typescript-json-schema';
import { getShareData } from '../shareData';

export type Config = {
  mock?: {
    mockNumber?: string;
    mockBoolean?: string;
    mockString?: string;
    mockKeyWordEqual?: {
      key: string;
      value: string;
    }[];
    mockKeyWordLike?: {
      key: string;
      value: string;
    }[];
  };
  commonlyUsedBlock?: string[];
};

export const getMockConfig: () => Config = () => {
  const { activeWindow } = getShareData();
  let config: Config;
  if (fs.existsSync(path.join(activeWindow || '', '.lowcoderc'))) {
    config = fs.readJSONSync(path.join(activeWindow || '', '.lowcoderc'));
  } else {
    config = {};
  }
  return config;
};

export const mockFromSchema = (schema: any) => {
  let listIndex = 1;
  const config = getMockConfig();
  const mockConfig = config.mock;

  const getMockValue = (key: string, defaultValue: string, type = 'number') => {
    const value = defaultValue;
    const mockKeyWordEqualConfig = mockConfig?.mockKeyWordEqual || [];
    for (let i = 0; i < mockKeyWordEqualConfig.length; i++) {
      if (key.toUpperCase() === mockKeyWordEqualConfig[i].key.toUpperCase()) {
        if (typeof mockKeyWordEqualConfig[i].value === 'string') {
          const array = mockKeyWordEqualConfig[i].value.split('&&');
          if (array.length > 1) {
            if (type === array[1]) {
              return array[0];
            }
            return value;
          }
        }
        return mockKeyWordEqualConfig[i].value;
      }
    }
    const mockKeyWordLikeConfig = mockConfig?.mockKeyWordLike || [];
    for (let i = 0; i < mockKeyWordLikeConfig.length; i++) {
      if (
        key.toUpperCase().indexOf(mockKeyWordLikeConfig[i].key.toUpperCase()) >
        -1
      ) {
        if (typeof mockKeyWordLikeConfig[i].value === 'string') {
          const array = mockKeyWordLikeConfig[i].value.split('&&');
          if (array.length > 1) {
            if (type === array[1]) {
              return array[0];
            }
            return value;
          }
        }
        return mockKeyWordLikeConfig[i].value;
      }
    }

    return value;
  };

  const formatProperty = (property: any, key: string = '') => {
    let jsonStr = '';
    let listStr: string[] = [];
    if (property.type === 'object') {
      jsonStr += `${key ? `${key}: {` : ''}`;
      Object.keys(property.properties).map((childPropertyKey) => {
        const childProperty = property.properties[childPropertyKey];
        const { jsonStr: childJsonStr, listStr: childListStr } = formatProperty(
          childProperty,
          childPropertyKey,
        );
        jsonStr += childJsonStr;
        listStr = listStr.concat(childListStr);
      });
      jsonStr += `${key ? '},' : ''}`;
    } else if (property.type === 'array') {
      if (Object.keys(property.items).length > 0) {
        const index = listIndex;
        listIndex++;
        let itemStr = `
			 const list${index}=[];
			 for(let i = 0; i < 10 ; i++){
			  list${index}.push(
		  `;
        if (property.items.type === 'object') {
          itemStr += '{';
          Object.keys(property.items.properties).map((itemPropertyKey) => {
            const itemProperty = property.items.properties[itemPropertyKey];
            const { jsonStr: itemJsonStr, listStr: itemListStr } =
              formatProperty(itemProperty, itemPropertyKey);
            itemStr += itemJsonStr;
            listStr = listStr.concat(itemListStr);
          });
          itemStr += `})}`;
        } else {
          if (property.items.type === 'string') {
            itemStr += getMockValue(
              key,
              mockConfig?.mockString || '',
              'string',
            );
          } else {
            itemStr += getMockValue(
              key,
              mockConfig?.mockNumber || 'Random.natural(1000,1000)',
            );
          }
          itemStr += `)}`;
        }
        listStr.push(itemStr);
        jsonStr += `${key}: list${index},`;
      } else {
        jsonStr += `${key}: [],`;
      }
    } else if (property.type === 'number') {
      jsonStr += `${key}: ${getMockValue(
        key,
        mockConfig?.mockNumber || 'Random.natural(1000,1000)',
      )},`;
    } else if (property.type === 'boolean') {
      jsonStr += `${key}: ${getMockValue(
        key,
        mockConfig?.mockBoolean || 'false',
        'boolean',
      )},`;
    } else if (property.type === 'string') {
      jsonStr += `${key}: ${getMockValue(
        key,
        mockConfig?.mockString || 'Random.cword(5, 7)',
        'string',
      )},`;
    }
    return {
      jsonStr,
      listStr,
    };
  };
  const { jsonStr, listStr } = formatProperty(schema);
  return {
    mockCode: listStr.join('\n'),
    mockData: `{${jsonStr}}`,
  };
};

export const typescriptToMock = (oriType: string) => {
  let type = oriType;
  const tempDir = path.join(os.homedir(), '.lowcode/temp');
  const filePath = path.join(tempDir, 'ts.ts');
  if (!fs.existsSync(filePath)) {
    fs.createFileSync(filePath);
  }

  // 处理最外层是数组类型的场景
  if (!type.trim().endsWith('}')) {
    type = `{ result: ${type} }`;
  }
  fs.writeFileSync(filePath, `export interface TempType ${type}`, {
    encoding: 'utf-8',
  });

  const program = TJS.getProgramFromFiles([filePath]);
  const schema = TJS.generateSchema(program, 'TempType') as any;
  if (schema === null) {
    throw new Error('根据TS类型生成JSON Schema失败');
  }
  const { mockCode, mockData } = mockFromSchema(schema);
  return {
    mockCode,
    mockData: !oriType.trim().endsWith('}') ? 'list1' : mockData,
  };
};
