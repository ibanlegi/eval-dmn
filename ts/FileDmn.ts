import { FileImport, Result } from "./FileImport";
import DmnViewer from "dmn-js";
import DmnModdle from 'dmn-moddle';
import * as DMN_JS from '../ts/types/DMN-JS';
import * as feelin from "feelin";

export default class FileDmn extends FileImport {
  private readonly _canvasID: string | null;
  private _text_canvas_display: string = 'block';

  get get_text_canvas_display(): string {
    return this._text_canvas_display;
  }

  constructor(list_files: FileList, canvasID: string) {
    super(list_files);
    this._canvasID = canvasID;
  }

  protected _verificationFormat(): boolean {
    const extension = this._file!.name.split('.').pop()?.toLowerCase() || '';
    const isDmnFile = extension === 'dmn' || this._file!.type === 'application/xml';
    return isDmnFile;
  }

  public clearCanvas(canvasElement: HTMLElement): void {
    while (canvasElement.firstChild) {
      canvasElement.removeChild(canvasElement.firstChild);
    }
    this._text_canvas_display = 'block';


  }

  public async importAndDisplayFileDmn(): Promise<void> {
    try {
      const dmnJS = new DmnViewer({
        container: `#${this._canvasID}`
      });

      const xml = await this.getContent();
      const { warnings } = await dmnJS.importXML(xml);

      dmnJS
        .getActiveViewer()
        .get(this._canvasID);

      if (warnings.length) {
        this._message = `Importation avec des erreurs: ${warnings}.`;
      } else {
        this._message = `Affichage avec succès ${this.getName}.`;
        this._text_canvas_display = 'none';
      }
    } catch (err) {
      this._message = String(err);
      this._correct = Result.Incorrect;
      this._text_canvas_display = 'block';
    }
  }

  public async transformXmlToJs(): Promise<DMN_JS.DMN_data> {
    return new Promise(async (resolve, reject) => {
      // Créer une nouvelle instance de DmnModdle pour traiter le modèle DMN
      const moddle = new DmnModdle();

      try {
        // Charger le contenu XML du fichier et extraire l'élément racine avec le type 'dmn:Definitions'
        const { rootElement } = await moddle.fromXML(await this.getContent(), 'dmn:Definitions');

        const donnees: DMN_JS.DMN_data = {
          file_content: {
            $type: 'dmn:Definitions',
            drgElement: rootElement.drgElement,
          },
          file_name: this._file!.name,
          me: rootElement,
        };


        // Informer sur la réussite de la transformation
        this._message = `Transformation en structure JavaScript réussie.`;


        // Résoudre la promesse avec la structure JavaScript résultante
        resolve(donnees);
      } catch (error) {
        // En cas d'erreur, marquer le résultat comme incorrect et rejeter la promesse avec un message d'erreur
        this._correct = Result.Incorrect;
        reject(new Error(`Erreur lors de la transformation : ${error}`));
      }
    });
  }

  public evaluateDMNExpression(dmnExpression: string, inputData: object): any {
    try {
      const result = feelin.evaluate(dmnExpression, inputData);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de l'évaluation de l'expression DMN : ${error}`);
    }
  }

  public handlingFeelinExpression(dmnData: DMN_JS.DMN_data, inputData: object): { inputData: object; outputData: object } {
    //---- Fonctions locales ---
    const buildFeelinExpression = (dmnData: DMN_JS.DMN_data): DMN_JS.TableExpressions => {
      const tableExpressionsGrouped: DMN_JS.TableExpressions = {};
      const processDrgElement = (drgElement: DMN_JS.ModdleElement) => {
        // Si c'est une décision avec une table de décision
        if (DMN_JS.is_DMN_Decision(drgElement) && drgElement.decisionLogic && drgElement.decisionLogic.$type === DMN_JS._DMN_DecisionTable) {
          const decisionTable = drgElement.decisionLogic as DMN_JS.DMN_DecisionTable;
          // Ajoute l'expression de la table à l'objet des expressions regroupées.
          tableExpressionsGrouped[drgElement.id] = {
            name: drgElement.id,
            expressions: processDecisionTable(decisionTable, drgElement),
          };
        } else if (drgElement.$children) {
          drgElement.$children.forEach(processDrgElement);
        }
      };
      //---Fonction locale à la fonction buildFeelinExpression
      const processDecisionTable = (decisionTable: DMN_JS.DMN_DecisionTable, drgElement: any): string => {
        let tableExpression: string = "";

        drgElement?.informationRequirement?.forEach((infoRequirement: { $type: string; requiredDecision: { href: string; }; }) => {
          if (infoRequirement.$type === 'dmn:InformationRequirement' && infoRequirement.requiredDecision) {
            const requiredDecisionId = infoRequirement.requiredDecision.href.replace('#', '');
            const requiredDecision = findDrgElementById(requiredDecisionId, dmnData.file_content as DMN_JS.DMN_Definitions);
            if (requiredDecision && DMN_JS.is_DMN_Decision(requiredDecision)) {
              processDecisionTable(requiredDecision.decisionLogic as DMN_JS.DMN_DecisionTable, requiredDecision);
            }
          }
        });

        tableExpression += decisionTable.rule.map((rule: DMN_JS.DMN_DecisionRule) => {
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

      const findDrgElementById = (id: string, definitions: DMN_JS.DMN_Definitions): DMN_JS.ModdleElement | undefined => {
        return definitions.drgElement.find((element) => element.id === id);
      };

      if (typeof dmnData.file_content === 'object' && DMN_JS.is_DMN_Definitions(dmnData.file_content as DMN_JS.DMN_Definitions)) {
        const drgElements = (dmnData.file_content as DMN_JS.DMN_Definitions).drgElement;
        drgElements.forEach(processDrgElement);
      }


      return tableExpressionsGrouped;
    }
    //---- Code principal ----
    try {
      // Implémentez la logique pour générer l'expression "feelin" à partir des données DMN
      const feelinExpression = buildFeelinExpression(dmnData);
      let outputData: { [tableName: string]: any } = {};
      let data: { [tableName: string]: any } = inputData;

      Object.keys(feelinExpression).reverse().forEach((tableName) => {
        const table: DMN_JS.TableInfo = feelinExpression[tableName];
        outputData[tableName] = this.evaluateDMNExpression(table.expressions, data);
        data = { ...data, ...outputData };
      });

      return { inputData, outputData };
    } catch (error) {
      this._correct = Result.Incorrect;
      throw new Error(`Erreur lors de la génération de l'expression Feelin : ${error}`);
    }
  }


  public formatResult(outputData: { [tableName: string]: any }, inputData: object): string {
    try {
      // Construire le tableau HTML
      let inputPrint = ``;
      Object.keys(inputData).forEach((tableName) => { inputPrint += `<tr><td>${tableName}</td> <td>${inputData[tableName as keyof typeof inputData]}</td></tr>` });
      let outputPrint = ``;
      Object.keys(outputData).forEach((tableName) => { outputPrint += `<tr><td>${tableName}</td> <td> ${outputData[tableName]}</td></tr>` });
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
    } catch (error) {
      this._correct = Result.Incorrect;
      throw new Error(`Erreur lors de la construction du tableau HTML : ${error}`);
    }
  }
}