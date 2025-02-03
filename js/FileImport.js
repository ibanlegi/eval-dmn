export var Result;
(function (Result) {
    Result["Correct"] = "Correct";
    Result["Incorrect"] = "Incorrect";
    Result["Invalid_format"] = "Invalid format";
})(Result || (Result = {}));
export class FileImport {
    get correct() {
        return this._correct;
    }
    get getFormat() {
        return this._file.type;
    }
    get getName() {
        return this._file.name;
    }
    get get_message() {
        return this._message;
    }
    constructor(list_files) {
        this._correct = Result.Incorrect;
        this._message = 'default message';
        this._content = '';
        if (list_files && list_files.length > 0) {
            this._file = list_files[0];
            if (this._verificationFormat()) {
                this._correct = Result.Correct;
                this._message = `${this.getName} importé.`;
            }
            else {
                this._correct = Result.Invalid_format;
                this._message = `Echec importation ${this.getName} : ${this.correct}.`;
            }
        }
    }
    _verificationFormat() {
        return true;
    }
    getContent() {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                var _a;
                const contenu = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                resolve(contenu);
            };
            reader.onerror = function (error) {
                reject(error);
            };
            if (this._file) {
                reader.readAsText(this._file);
            }
            else {
                reject(new Error('Aucun fichier sélectionné.'));
                this._correct = Result.Incorrect;
            }
        });
    }
}
//# sourceMappingURL=FileImport.js.map