import { FileImport } from "./FileImport";
export default class FileDmn extends FileImport {
    constructor(list_files) {
        super(list_files);
    }
    _verificationFormat() {
        var _a;
        console.log("verif JSON");
        const extension = ((_a = this._file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        const isDmnFile = extension === 'json' || this._file.type === 'application/json';
        return isDmnFile;
    }
}
//# sourceMappingURL=FileJson.js.map