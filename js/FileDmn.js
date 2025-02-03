var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FileImport, Result } from "./FileImport";
import DmnViewer from "dmn-js";
import DmnModdle from 'dmn-moddle';
import * as DMN_JS from '../ts/types/DMN-JS';
import * as feelin from "feelin";
export default class FileDmn extends FileImport {
    get get_text_canvas_display() {
        return this._text_canvas_display;
    }
    constructor(list_files, canvasID) {
        super(list_files);
        this._text_canvas_display = 'block';
        this._canvasID = canvasID;
    }
    _verificationFormat() {
        var _a;
        const extension = ((_a = this._file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        const isDmnFile = extension === 'dmn' || this._file.type === 'application/xml';
        return isDmnFile;
    }
    clearCanvas(canvasElement) {
        while (canvasElement.firstChild) {
            canvasElement.removeChild(canvasElement.firstChild);
        }
        this._text_canvas_display = 'block';
    }
    importAndDisplayFileDmn() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dmnJS = new DmnViewer({
                    container: `#${this._canvasID}`
                });
                const xml = yield this.getContent();
                const { warnings } = yield dmnJS.importXML(xml);
                dmnJS
                    .getActiveViewer()
                    .get(this._canvasID);
                if (warnings.length) {
                    this._message = `Importation avec des erreurs: ${warnings}.`;
                }
                else {
                    this._message = `Affichage avec succès ${this.getName}.`;
                    this._text_canvas_display = 'none';
                }
            }
            catch (err) {
                this._message = String(err);
                this._correct = Result.Incorrect;
                this._text_canvas_display = 'block';
            }
        });
    }
    transformXmlToJs() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                // Créer une nouvelle instance de DmnModdle pour traiter le modèle DMN
                const moddle = new DmnModdle();
                try {
                    // Charger le contenu XML du fichier et extraire l'élément racine avec le type 'dmn:Definitions'
                    const { rootElement } = yield moddle.fromXML(yield this.getContent(), 'dmn:Definitions');
                    const donnees = {
                        file_content: {
                            $type: 'dmn:Definitions',
                            drgElement: rootElement.drgElement,
                        },
                        file_name: this._file.name,
                        me: rootElement,
                    };
                    // Informer sur la réussite de la transformation
                    this._message = `Transformation en structure JavaScript réussie.`;
                    // Résoudre la promesse avec la structure JavaScript résultante
                    resolve(donnees);
                }
                catch (error) {
                    // En cas d'erreur, marquer le résultat comme incorrect et rejeter la promesse avec un message d'erreur
                    this._correct = Result.Incorrect;
                    reject(new Error(`Erreur lors de la transformation : ${error}`));
                }
            }));
        });
    }
    evaluateDMNExpression(dmnExpression, inputData) {
        try {
            const result = feelin.evaluate(dmnExpression, inputData);
            return result;
        }
        catch (error) {
            throw new Error(`Erreur lors de l'évaluation de l'expression DMN : ${error}`);
        }
    }
    handlingFeelinExpression(dmnData, inputData) {
        //---- Fonctions locales ---
        const buildFeelinExpression = (dmnData) => {
            const tableExpressionsGrouped = {};
            const processDrgElement = (drgElement) => {
                // Si c'est une décision avec une table de décision
                if (DMN_JS.is_DMN_Decision(drgElement) && drgElement.decisionLogic && drgElement.decisionLogic.$type === DMN_JS._DMN_DecisionTable) {
                    const decisionTable = drgElement.decisionLogic;
                    // Ajoute l'expression de la table à l'objet des expressions regroupées.
                    tableExpressionsGrouped[drgElement.id] = {
                        name: drgElement.id,
                        expressions: processDecisionTable(decisionTable, drgElement),
                    };
                }
                else if (drgElement.$children) {
                    drgElement.$children.forEach(processDrgElement);
                }
            };
            //---Fonction locale à la fonction buildFeelinExpression
            const processDecisionTable = (decisionTable, drgElement) => {
                var _a;
                let tableExpression = "";
                (_a = drgElement === null || drgElement === void 0 ? void 0 : drgElement.informationRequirement) === null || _a === void 0 ? void 0 : _a.forEach((infoRequirement) => {
                    if (infoRequirement.$type === 'dmn:InformationRequirement' && infoRequirement.requiredDecision) {
                        const requiredDecisionId = infoRequirement.requiredDecision.href.replace('#', '');
                        const requiredDecision = findDrgElementById(requiredDecisionId, dmnData.file_content);
                        if (requiredDecision && DMN_JS.is_DMN_Decision(requiredDecision)) {
                            processDecisionTable(requiredDecision.decisionLogic, requiredDecision);
                        }
                    }
                });
                tableExpression += decisionTable.rule.map((rule) => {
                    const inputConditions = rule.inputEntry.map((entry, index) => {
                        const formattedEntry = entry.text.includes(',') ? `[${entry.text}]` : entry.text;
                        return entry.text.length === 0 ? `true` : `${decisionTable.input[index].inputExpression.text} in ${formattedEntry}`;
                    });
                    const outputExpression = rule.outputEntry.map((entry) => entry.text).join(", ");
                    return `if ((${inputConditions.join(") and (")})) then ${outputExpression} else`;
                }).join(" ").concat(" \"Erreur\"");
                //L'expression ressemble à: if((var1 in condtions1) and (var2 in conditions2)) then output1 else "Erreur"
                console.log(tableExpression);
                return tableExpression;
            };
            const findDrgElementById = (id, definitions) => {
                return definitions.drgElement.find((element) => element.id === id);
            };
            if (typeof dmnData.file_content === 'object' && DMN_JS.is_DMN_Definitions(dmnData.file_content)) {
                const drgElements = dmnData.file_content.drgElement;
                drgElements.forEach(processDrgElement);
            }
            return tableExpressionsGrouped;
        };
        //---- Code principal ----
        try {
            // Implémentez la logique pour générer l'expression "feelin" à partir des données DMN
            const feelinExpression = buildFeelinExpression(dmnData);
            let outputData = {};
            let data = inputData;
            Object.keys(feelinExpression).reverse().forEach((tableName) => {
                const table = feelinExpression[tableName];
                outputData[tableName] = this.evaluateDMNExpression(table.expressions, data);
                data = Object.assign(Object.assign({}, data), outputData);
            });
            return { inputData, outputData };
        }
        catch (error) {
            this._correct = Result.Incorrect;
            throw new Error(`Erreur lors de la génération de l'expression Feelin : ${error}`);
        }
    }
    formatResult(outputData, inputData) {
        try {
            // Construire le tableau HTML
            let inputPrint = ``;
            Object.keys(inputData).forEach((tableName) => { inputPrint += `<tr><td>${tableName}</td> <td>${inputData[tableName]}</td></tr>`; });
            let outputPrint = ``;
            Object.keys(outputData).forEach((tableName) => { outputPrint += `<tr><td>${tableName}</td> <td> ${outputData[tableName]}</td></tr>`; });
            const tableauHTML = `
          <h5>Données d'entrées :</h5>
          <table  class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Donnée :</th>
                <th scope="col">Valeur :</th>
              </tr>
            </thead>
            <tbody>
              ${inputPrint}
            </tbody>
          </table>
          <br>
          <h5>Données évaluées :</h5>
          <table  class="table table-hover">
            <thead>
              <tr>
                <th scope="col">Donnée :</th>
                <th scope="col">Valeur :</th>
              </tr>
            </thead>
            <tbody>
              ${outputPrint}
            </tbody>
          </table>
        `;
            console.log(tableauHTML);
            return tableauHTML;
        }
        catch (error) {
            this._correct = Result.Incorrect;
            throw new Error(`Erreur lors de la construction du tableau HTML : ${error}`);
        }
    }
}
//# sourceMappingURL=FileDmn.js.map