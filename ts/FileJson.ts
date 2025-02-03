import {FileImport} from "./FileImport";

export default class FileDmn extends FileImport {
    constructor(list_files: FileList){
        super(list_files);
    }

    protected _verificationFormat(): boolean {
        console.log("verif JSON");
        const extension = this._file!.name.split('.').pop()?.toLowerCase() || '';
        const isDmnFile = extension === 'json' || this._file!.type === 'application/json';
        return isDmnFile;
      }
}