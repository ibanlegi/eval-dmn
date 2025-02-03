var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//---- Importations modules
import FileDmn from './FileDmn';
import FileJson from './FileJson';
import { Result } from './FileImport';
import Swal from 'sweetalert2';
window.addEventListener("DOMContentLoaded", function () {
    return __awaiter(this, void 0, void 0, function* () {
        let current_fileDMN;
        let current_fileJSON;
        //---- Récupération HTMLElement ----
        const fileInputDMN = document.getElementById('fileInput_DMN');
        const fileInputJSON = document.getElementById('fileInput_JSON');
        const btnEvaluation = document.getElementById('btnEvaluation');
        //---- Evénements ----
        fileInputDMN.addEventListener('change', (event) => __awaiter(this, void 0, void 0, function* () {
            //---- Récupération HTMLElement ----
            const input = event.target;
            const nameFile = document.getElementById('nameFileDMN');
            const messageElement = document.getElementById('etatFileDMN');
            const canvasElement = document.getElementById('canvas');
            const backgroundTextElement = document.getElementById('background-text');
            const btnClear = document.getElementById('btnClear');
            //---- Affectation fichier ----
            current_fileDMN = new FileDmn(input.files, 'canvas');
            if (current_fileDMN) {
                //---- Ajout événement pour le bouton effacer
                btnClear.addEventListener('click', () => {
                    current_fileDMN.clearCanvas(canvasElement);
                    backgroundTextElement.style.display = current_fileDMN.get_text_canvas_display;
                });
                //---- Traitement du fichier ----
                current_fileDMN.clearCanvas(canvasElement); //Supprimer l'ancien diagramme dmn
                if (current_fileDMN.correct == Result.Correct) {
                    nameFile.innerHTML = current_fileDMN.getName;
                    //Afficher diagramme
                    yield current_fileDMN.importAndDisplayFileDmn();
                    backgroundTextElement.style.display = current_fileDMN.get_text_canvas_display;
                }
                else {
                    nameFile.innerHTML = `<span style="color: red;">${current_fileDMN.correct} (${current_fileDMN.getFormat})`;
                }
                messageElement.innerHTML = current_fileDMN.get_message;
            }
        }));
        fileInputJSON.addEventListener('change', (event) => {
            //---- Récupération HTMLElement ----
            const input = event.target;
            const nameFileJSON = document.getElementById('nameFileJSON');
            const messageElement = this.document.getElementById('etatFileJSON');
            current_fileJSON = new FileJson(input.files);
            if (current_fileJSON.correct === Result.Correct) {
                nameFileJSON.innerHTML = current_fileJSON.getName;
            }
            else {
                nameFileJSON.innerHTML = `<span style="color: red;">${current_fileJSON.correct} (${current_fileJSON.getFormat})`;
            }
            messageElement.innerHTML = current_fileJSON.get_message;
        });
        btnEvaluation.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (current_fileDMN && current_fileJSON && current_fileDMN.correct === Result.Correct && current_fileJSON.correct === Result.Correct) {
                    // Transformation du fichier dmn en structure JS
                    const jsStructure = yield current_fileDMN.transformXmlToJs();
                    // Gérer l'expression feel: génération, évaluation et retour de l'expression 
                    const evaluationResult = current_fileDMN.handlingFeelinExpression(jsStructure, JSON.parse(yield current_fileJSON.getContent()));
                    console.log(evaluationResult);
                    // Afficher le SweetAlert avec le contenu HTML
                    Swal.fire({
                        html: current_fileDMN.formatResult(evaluationResult.outputData, evaluationResult.inputData),
                        confirmButtonText: 'Fermer'
                    });
                }
                else {
                    Swal.fire({
                        html: `Erreur lors de l'évaluation des fichiers: 
                <br>Entrée dmn :  ${current_fileDMN === null || current_fileDMN === void 0 ? void 0 : current_fileDMN.getName} (${current_fileDMN === null || current_fileDMN === void 0 ? void 0 : current_fileDMN.correct})
                <br>Entrée json : ${current_fileJSON === null || current_fileJSON === void 0 ? void 0 : current_fileJSON.getName} (${current_fileJSON === null || current_fileJSON === void 0 ? void 0 : current_fileJSON.correct})`,
                        confirmButtonText: 'Fermer'
                    });
                }
            }
            catch (error) {
                Swal.fire(`Erreur : ${error}`);
            }
        }));
    });
});
//# sourceMappingURL=main.js.map