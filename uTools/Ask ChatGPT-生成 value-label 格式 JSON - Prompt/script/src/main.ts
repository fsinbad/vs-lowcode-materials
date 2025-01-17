import { clipboard } from 'electron';
import { getBlockJsonValidSchema } from '@share/utils/uTools';

export const bootstrap = async (scriptFile?: string) => {
  const schema = getBlockJsonValidSchema(scriptFile!);
  const clipboardText =
    (clipboard.readText() || '').trim() ||
    '客户验收状态:1.无需验收、2.待验收、3已验收';
  const typeName = 'IOption';
  const requestPrompt =
    `You are a service that translates user requests into JSON objects of type "${typeName}" according to the following TypeScript definitions:\n` +
    `\`\`\`\n${schema}\`\`\`\n` +
    `The following is a user request:\n` +
    `"""\n${clipboardText}\n"""\n` +
    `The following is the user request translated into a JSON object with 2 spaces of indentation and no properties with the value undefined:\n`;
  clipboard.writeText(requestPrompt);
  utools.showNotification('prompt 已经写入剪贴板');
  return requestPrompt;
};
