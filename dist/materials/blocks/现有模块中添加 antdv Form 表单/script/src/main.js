"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleComplete = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const context_1 = require("./context");
async function handleComplete() {
    const createBlockPath = context_1.context.lowcodeContext?.createBlockPath;
    if (createBlockPath) {
        // #region 更新 model.ts 文件
        const modelFileContent = fs
            .readFileSync(path.join(createBlockPath, 'temp.model.ts'))
            .toString();
        let modelFileContentOld = fs
            .readFileSync(path.join(createBlockPath, 'model.ts').toString())
            .toString();
        const keywords = [
            '// lowcode-model-type',
            '// lowcode-model-defalut-data',
            '// lowcode-model-variable',
            '// lowcode-model-return-variable',
        ];
        const modelSplitArr = modelFileContent.split(new RegExp(keywords.join('|'), 'ig'));
        const modelType = modelSplitArr[1];
        const modelDefaultData = modelSplitArr[2];
        const modelVariable = modelSplitArr[3];
        const modelReturnVariable = modelSplitArr[4].replace(/\n/g, '');
        if (!modelFileContentOld.includes('// lowcode-model-type')) {
            modelFileContentOld = modelFileContentOld.replace('export const useModel', '// lowcode-model-type\nexport const useModel');
        }
        modelFileContentOld = modelFileContentOld.replace('// lowcode-model-type', modelType);
        if (!modelFileContentOld.includes('// lowcode-model-defalut-data')) {
            modelFileContentOld = modelFileContentOld.replace('export const useModel', '// lowcode-model-defalut-data\nexport const useModel');
        }
        modelFileContentOld = modelFileContentOld.replace('// lowcode-model-defalut-data', modelDefaultData);
        if (!modelFileContentOld.includes('// lowcode-model-variable')) {
            modelFileContentOld = modelFileContentOld.replace('return {', '// lowcode-model-variable\nreturn {');
        }
        modelFileContentOld = modelFileContentOld.replace('// lowcode-model-variable', modelVariable);
        if (!modelFileContentOld.includes('// lowcode-model-return-variable')) {
            modelFileContentOld = modelFileContentOld.replace('return {', 'return {\n// lowcode-model-return-variable');
        }
        modelFileContentOld = modelFileContentOld.replace('// lowcode-model-return-variable', modelReturnVariable);
        fs.writeFileSync(path.join(createBlockPath, 'model.ts'), modelFileContentOld);
        fs.removeSync(path.join(createBlockPath, 'temp.model.ts'));
        // #endregion
        // #region 更新 service.ts 文件
        const serviceFileContent = fs
            .readFileSync(path.join(createBlockPath, 'temp.service.ts').toString())
            .toString();
        let serviceFileContentOld = fs
            .readFileSync(path.join(createBlockPath, 'service.ts').toString())
            .toString()
            .trim();
        const serviceSplitArr = serviceFileContent.split(new RegExp(['// lowcode-service-method'].join('|'), 'ig'));
        const serviceMethod = serviceSplitArr[1];
        if (!serviceFileContentOld.includes('// lowcode-service-method')) {
            serviceFileContentOld = `${serviceFileContentOld.slice(0, serviceFileContentOld.length - 1)}// lowcode-service-method\n}`;
        }
        serviceFileContentOld = serviceFileContentOld.replace('// lowcode-service-method', serviceMethod);
        fs.writeFileSync(path.join(createBlockPath, 'service.ts'), serviceFileContentOld);
        fs.removeSync(path.join(createBlockPath, 'temp.service.ts'));
        // #endregion
        // #region 更新 presenter.tsx 文件
        const presenterFileContent = fs
            .readFileSync(path.join(createBlockPath, 'temp.presenter.tsx').toString())
            .toString();
        let presenterFileContentOld = fs
            .readFileSync(path.join(createBlockPath, 'presenter.tsx').toString())
            .toString();
        const presenterSplitArr = presenterFileContent.split(new RegExp(['// lowcode-presenter-variable', '// lowcode-presenter-return'].join('|'), 'ig'));
        const presenterVariable = presenterSplitArr[1];
        const presenterReturn = presenterSplitArr[2];
        if (!presenterFileContentOld.includes('// lowcode-presenter-variable')) {
            presenterFileContentOld = presenterFileContentOld.replace('return {', `// lowcode-presenter-variable\nreturn {`);
        }
        presenterFileContentOld = presenterFileContentOld.replace('// lowcode-presenter-variable', presenterVariable);
        if (!presenterFileContentOld.includes('// lowcode-presenter-return')) {
            presenterFileContentOld = presenterFileContentOld.replace('return {', 'return {\n// lowcode-presenter-return');
        }
        presenterFileContentOld = presenterFileContentOld.replace('// lowcode-presenter-return', presenterReturn);
        fs.writeFileSync(path.join(createBlockPath, 'presenter.tsx'), presenterFileContentOld);
        fs.removeSync(path.join(createBlockPath, 'temp.presenter.tsx'));
        // #endregion
        // #region 更新 index.vue 文件
        const vueFileContent = fs
            .readFileSync(path.join(createBlockPath, 'temp.index.vue').toString())
            .toString();
        let vueFileContentOld = fs
            .readFileSync(path.join(createBlockPath, 'index.vue').toString())
            .toString();
        const vueSplitArr = vueFileContent.split(new RegExp(['<!-- lowcode-vue-template -->', '// lowcode-vue-import'].join('|'), 'ig'));
        const vueTemplate = vueSplitArr[1];
        const vueImport = vueSplitArr[2];
        if (!vueFileContentOld.includes('<!-- lowcode-vue-template -->')) {
            const index = vueFileContentOld.lastIndexOf('</template>');
            vueFileContentOld = `${vueFileContentOld.substring(0, index)}<!-- lowcode-vue-template -->${vueFileContentOld.substring(index)}`;
        }
        vueFileContentOld = vueFileContentOld.replace('<!-- lowcode-vue-template -->', vueTemplate);
        if (!vueFileContentOld.includes('lowcode-vue-import')) {
            vueFileContentOld = vueFileContentOld.replace('<script lang="ts" setup>', `<script lang="ts" setup>\n// lowcode-vue-import`);
        }
        vueFileContentOld = vueFileContentOld.replace('// lowcode-vue-import', vueImport);
        fs.writeFileSync(path.join(createBlockPath, 'index.vue'), vueFileContentOld);
        fs.removeSync(path.join(createBlockPath, 'temp.index.vue'));
        // #endregion
    }
}
exports.handleComplete = handleComplete;
