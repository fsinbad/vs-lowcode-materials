/* eslint-disable no-template-curly-in-string */
import { getShareData, saveShareData as save } from '@share/utils/shareData';

export const bootstrap = async (scriptFile?: string) => {
  utools.redirect(['lowcode', 'lowcode'], {
    type: 'text',
    data: JSON.stringify({ scriptFile, route: '/config' }),
  });
};

const schema = {
  type: 'page',
  name: 'page',
  body: [
    {
      type: 'form',
      name: 'form',
      data: {},
      title: '',
      body: [
        // {
        //   type: 'input-text',
        //   id: 'u:11b127c5df46',
        //   label: 'activeWindow',
        //   name: 'activeWindow',
        //   description: '',
        // },
        {
          type: 'combo',
          label: 'oneAPI',
          name: 'oneAPI',
          multiple: true,
          addable: true,
          removable: true,
          removableMode: 'icon',
          addBtn: {
            label: '新增',
            icon: 'fa fa-plus',
            level: 'primary',
            size: 'sm',
            id: 'u:47ecb9e15ff1',
          },
          items: [
            {
              type: 'input-text',
              label: 'hostname',
              name: 'hostname',
              id: 'u:6496cac4f4b8',
              description: '',
            },
            {
              type: 'input-text',
              label: 'apiPath',
              name: 'apiPath',
              id: 'u:a701e97d81a6',
              description: '',
            },
            {
              type: 'switch',
              label: 'notHttps',
              option: '',
              name: 'notHttps',
              falseValue: false,
              trueValue: true,
              id: 'u:a3283c2ac1b6',
              value: false,
            },
            {
              type: 'input-number',
              label: 'port',
              name: 'port',
              keyboard: true,
              id: 'u:3d3695bd7ab2',
              step: 1,
            },
            {
              type: 'input-text',
              name: 'apiKey',
              placeholder: '',
              id: 'u:25b0c7b5e5a0',
              label: 'apiKey',
            },
            {
              type: 'input-text',
              label: 'model',
              name: 'model',
              id: 'u:ac0737858444',
              description: '',
            },
            {
              type: 'input-number',
              label: 'maxTokens',
              name: 'maxTokens',
              keyboard: true,
              id: 'u:a8cfb52c5e43',
              step: 1,
            },
            {
              type: 'input-number',
              label: 'temperature',
              name: 'temperature',
              keyboard: true,
              id: 'u:8797d33941aa',
              step: 1,
            },
            {
              type: 'input-text',
              label: 'proxyUrl',
              name: 'proxyUrl',
              description: '',
            },
            {
              type: 'switch',
              label: 'use',
              option: '',
              name: 'use',
              falseValue: false,
              trueValue: true,
              id: 'u:1ac806d7ad60',
              value: false,
            },
          ],
          id: 'u:186f183e9320',
          strictMode: false,
          syncFields: [],
          tabsMode: false,
          draggable: true,
          draggableTip: '可拖动排序',
          tabsStyle: 'line',
          tabsLabelTpl: '表单项${index+1}',
          multiLine: true,
          value: [{}],
        },
      ],
      submitText: '',
    },
  ],
  pullRefresh: {
    disabled: true,
  },
  regions: ['body'],
  style: {
    boxShadow: ' 0px 0px 0px 0px transparent',
  },
  asideResizor: false,
};

export const getDynamicFormSchema = () => {
  schema.body[0].data = getShareData();
  return schema;
};

export const saveDynamicFormSchema = (data: object) => save(data);
