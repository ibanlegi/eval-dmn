export enum Result {
    Correct = "Correct",
    Incorrect = "Incorrect",
    Invalid_format = "Invalid format"
}

export class FileImport {
    protected _file: File | undefined;
    protected _correct: Result = Result.Incorrect;
    protected _message: string = 'default message';
    protected _content: string = '';

    get correct(): Result {
        return this._correct;
    }

    get getFormat(): string {
        return this._file!.type;
    }

    get getName(): string {
        return this._file!.name;
    }

    get get_message(): string {
        return this._message;
    }

    constructor(list_files: FileList) {
        if (list_files && list_files.length > 0) {
            this._file = list_files[0];
            if (this._verificationFormat()) {
                this._correct = Result.Correct;
                this._message = `${this.getName} importé.`;
            } else {
                this._correct = Result.Invalid_format;
                this._message = `Echec importation ${this.getName} : ${this.correct}.`
            }
        }
    }


    protected _verificationFormat(): boolean {
        return true;
    }

    public getContent(): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const contenu = event.target?.result as string;
                resolve(contenu);
            };
            reader.onerror = function (error) {
                reject(error);
            };
            if (this._file) {
                reader.readAsText(this._file);
            } else {
                reject(new Error('Aucun fichier sélectionné.'));
                this._correct = Result.Incorrect;
            }
        });
    }


}