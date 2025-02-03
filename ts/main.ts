//---- Importations modules
import FileDmn from './FileDmn';
import FileJson from './FileJson';
import {Result} from './FileImport';
import Swal from 'sweetalert2';


window.addEventListener("DOMContentLoaded", async function () {
  let current_fileDMN: FileDmn | null;
  let current_fileJSON: FileJson | null;
  //---- Récupération HTMLElement ----
  const fileInputDMN = document.getElementById('fileInput_DMN') as HTMLInputElement;
  const fileInputJSON = document.getElementById('fileInput_JSON') as HTMLInputElement;
  const btnEvaluation = document.getElementById('btnEvaluation') as HTMLElement;

  //---- Evénements ----
  fileInputDMN.addEventListener('change', async (event) => {
    //---- Récupération HTMLElement ----
    const input = event.target as HTMLInputElement;
    const nameFile = document.getElementById('nameFileDMN') as HTMLElement;
    const messageElement = document.getElementById('etatFileDMN') as HTMLElement;
    const canvasElement = document.getElementById('canvas') as HTMLElement;
    const backgroundTextElement = document.getElementById('background-text') as HTMLElement;
    const btnClear = document.getElementById('btnClear') as HTMLElement;

    //---- Affectation fichier ----
    current_fileDMN = new FileDmn(input.files!, 'canvas');
    if (current_fileDMN) {
      //---- Ajout événement pour le bouton effacer
      btnClear.addEventListener('click', () => {
        current_fileDMN!.clearCanvas(canvasElement);
        backgroundTextElement.style.display = current_fileDMN!.get_text_canvas_display;
      });

      //---- Traitement du fichier ----
      current_fileDMN.clearCanvas(canvasElement); //Supprimer l'ancien diagramme dmn
      if (current_fileDMN.correct == Result.Correct) {
        nameFile.innerHTML = current_fileDMN.getName;
        //Afficher diagramme
        await current_fileDMN.importAndDisplayFileDmn();
        backgroundTextElement.style.display = current_fileDMN.get_text_canvas_display;
      } else {
        nameFile.innerHTML = `<span style="color: red;">${current_fileDMN.correct} (${current_fileDMN.getFormat})`;
      }
      messageElement.innerHTML = current_fileDMN.get_message;
    }

  });

  fileInputJSON.addEventListener('change', (event) => {
    //---- Récupération HTMLElement ----
    const input = event.target as HTMLInputElement;
    const nameFileJSON = document.getElementById('nameFileJSON') as HTMLElement;
    const messageElement = this.document.getElementById('etatFileJSON') as HTMLElement;

    current_fileJSON = new FileJson(input.files!);

    if (current_fileJSON.correct === Result.Correct) {
      nameFileJSON.innerHTML = current_fileJSON.getName;
    } else {
      nameFileJSON.innerHTML = `<span style="color: red;">${current_fileJSON.correct} (${current_fileJSON.getFormat})`;
    }
    messageElement.innerHTML = current_fileJSON.get_message;

  });

  btnEvaluation.addEventListener('click', async () => {
    try {
      if (current_fileDMN && current_fileJSON && current_fileDMN.correct === Result.Correct && current_fileJSON.correct === Result.Correct) {
        // Transformation du fichier dmn en structure JS
        const jsStructure = await current_fileDMN.transformXmlToJs();

        // Gérer l'expression feel: génération, évaluation et retour de l'expression 
        const evaluationResult = current_fileDMN.handlingFeelinExpression(jsStructure, JSON.parse(await current_fileJSON.getContent()));
        console.log(evaluationResult);

        // Afficher le SweetAlert avec le contenu HTML
        Swal.fire({
          html: current_fileDMN.formatResult(evaluationResult.outputData, evaluationResult.inputData),
          confirmButtonText: 'Fermer'
        });
      } else {
        Swal.fire({
          html: `Erreur lors de l'évaluation des fichiers: 
                <br>Entrée dmn :  ${current_fileDMN?.getName} (${current_fileDMN?.correct})
                <br>Entrée json : ${current_fileJSON?.getName} (${current_fileJSON?.correct})`,
          confirmButtonText: 'Fermer'
        });
      }
    } catch (error) {
      Swal.fire(`Erreur : ${error}`);
    }
  });

});
