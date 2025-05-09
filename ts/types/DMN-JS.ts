export interface DMN_data {
    file_content: Object | string // Data file content as JSON or raw string if not JSON...
    file_name: string
    me: ModdleElement
}

export interface DMN_file {
    file_content: string // DMN file content as XML...
    file_name: string
}

export function Set_current_diagram(diagram: DMN_file, data: DMN_data) {
    // Le diagramme courant est placé dans l'historique du navigateur :
    window.history.replaceState({
        data: data,
        diagram: diagram
    }, "");
}

export interface ModdleElement {// Racine du graphe d'héritage de 'dmn-moddle'
    $children: any;
    // $attrs: Object; // Unused...
    id: string;
    name: string;
    $parent: ModdleElement | undefined;
    $type: string;
}

// https://docs.camunda.org/manual/7.18/user-guide/dmn-engine/data-types/#supported-data-types
type _DMN_type_reference = 'boolean' | 'date' | 'double' | 'integer' | 'long' | 'string';
// On simplifie pour le moment :
export type DMN_type_reference = /*boolean | Date |*/ number | string;

export const _DMN_AuthorityRequirement: 'dmn:AuthorityRequirement' = 'dmn:AuthorityRequirement';
export const _DMN_BusinessKnowledgeModel: 'dmn:BusinessKnowledgeModel' = 'dmn:BusinessKnowledgeModel';
export const _DMN_Decision: 'dmn:Decision' = 'dmn:Decision';
export const _DMN_DecisionRule: 'dmn:DecisionRule' = 'dmn:DecisionRule';
export const _DMN_DecisionTable: 'dmn:DecisionTable' = 'dmn:DecisionTable';
export const _DMN_Definitions: 'dmn:Definitions' = 'dmn:Definitions';
export const _DMN_DMNElementReference: 'dmn:DMNElementReference' = 'dmn:DMNElementReference';
export const _DMN_InformationItem: 'dmn:InformationItem' = 'dmn:InformationItem';
export const _DMN_InformationRequirement: 'dmn:InformationRequirement' = 'dmn:InformationRequirement';
export const _DMN_InputClause: 'dmn:InputClause' = 'dmn:InputClause';
export const _DMN_InputData: 'dmn:InputData' = 'dmn:InputData';
export const _DMN_KnowledgeRequirement: 'dmn:KnowledgeRequirement' = 'dmn:KnowledgeRequirement';
export const _DMN_KnowledgeSource: 'dmn:KnowledgeSource' = 'dmn:KnowledgeSource';
export const _DMN_LiteralExpression: 'dmn:LiteralExpression' = 'dmn:LiteralExpression';
export const _DMN_OutputClause: 'dmn:OutputClause' = 'dmn:OutputClause';
export const _DMN_UnaryTests: 'dmn:UnaryTests' = 'dmn:UnaryTests';

export interface DMN_AuthorityRequirement extends ModdleElement {
    $type: typeof _DMN_AuthorityRequirement;
    requiredAuthority: DMN_DMNElementReference;
    requiredDecision: DMN_DMNElementReference;
}

export interface DMN_BusinessKnowledgeModel extends ModdleElement {
    $type: typeof _DMN_BusinessKnowledgeModel;
}

export interface DMN_Decision extends ModdleElement {
    $type: typeof _DMN_Decision;
    authorityRequirement: Array<DMN_AuthorityRequirement>; // Knowledge source(s)
    decisionLogic: DMN_DecisionTable;
    informationRequirement: Array<DMN_InformationRequirement>; // Input data
    knowledgeRequirement: Array<DMN_KnowledgeRequirement>; // Knowledge model(s)
    name: string;
}

export function is_DMN_Decision(me: ModdleElement): me is DMN_Decision {
    return '$type' in me && me.$type === _DMN_Decision && 'decisionLogic' in me;
}

export interface DMN_DecisionTable extends ModdleElement {
    $type: typeof _DMN_DecisionTable;
    input: Array<DMN_InputClause>;
    output: Array<DMN_OutputClause>;
    rule: Array<DMN_DecisionRule>;
}

/*export interface DMN_DecisionRule extends ModdleElement {
    $type: typeof _DMN_DecisionRule;
    description: string;
    inputEntry: Array<DMN_UnaryTests>;
    outputEntry: Array<DMN_LiteralExpression>;
}*/
export interface DMN_DecisionRule extends ModdleElement {
    $type: typeof _DMN_DecisionRule;
    description: string;
    inputEntry: Array<DMN_BaseExpression>;
    outputEntry: Array<DMN_BaseExpression>;
}

export interface DMN_Definitions extends ModdleElement {
    $type: typeof _DMN_Definitions; // 'dmn:Definitions';
    // artifact: Array<ModdleElement>; // 'dmn:Association' | 'dmn:TextAnnotation'
    // dmnDI: DMNDI_DMNDI;
    drgElement: Array<DMN_BusinessKnowledgeModel | DMN_Decision | DMN_InputData | DMN_KnowledgeSource>;
}

export function is_DMN_Definitions(me: ModdleElement): me is DMN_Definitions {
    return '$type' in me && me.$type === _DMN_Definitions && 'drgElement' in me;
}

export function is_DMN_DecisionTable(me: ModdleElement): me is DMN_DecisionTable {
    return '$type' in me && me.$type === _DMN_DecisionTable && 'input' in me && 'rule' in me;
}


// export interface DMNDI_DMNDI extends ModdleElement {
//     $type: 'dmndi:DMNDI';
//     diagrams: Array<DMNDI_DMNDiagram>;
// }

// export interface DMNDI_DMNDiagram extends ModdleElement {
//     $type: 'dmndi:DMNDiagram';
//     diagramElements: Array<ModdleElement>; // 'dmndi:DMNEdge' | 'dmndi:DMNShape'
// }

export interface DMN_DMNElementReference extends ModdleElement {
    $type: typeof _DMN_DMNElementReference;
    href: string; // Example: "#temperature_id"
}

export interface DMN_InformationItem extends ModdleElement {
    $type: typeof _DMN_InformationItem;
    typeRef: _DMN_type_reference;
}

export interface DMN_InformationRequirement extends ModdleElement {
    $type: typeof _DMN_InformationRequirement;
    requiredDecision: DMN_DMNElementReference;
    requiredInput: DMN_DMNElementReference;
}

export function is_DMN_InformationRequirement(me: ModdleElement): me is DMN_InformationRequirement {
    return '$type' in me && me.$type === _DMN_InformationRequirement && 'requiredInput' in me;
}

export interface DMN_InputClause extends ModdleElement {
    $type: typeof _DMN_InputClause;
    inputExpression: DMN_LiteralExpression;
    label: string;
    typeRef: _DMN_type_reference;
    width: number;
}

export interface DMN_InputData extends ModdleElement {
    $type: typeof _DMN_InputData;
    name: string;
    variable: DMN_InformationItem;
}

export function is_DMN_InputData(me: ModdleElement): me is DMN_InputData {
    return '$type' in me && me.$type === _DMN_InputData;
}

export interface DMN_KnowledgeRequirement extends ModdleElement {
    $type: typeof _DMN_KnowledgeRequirement;
    requiredKnowledge: DMN_DMNElementReference;
}

export interface DMN_KnowledgeSource extends ModdleElement {
    $type: typeof _DMN_KnowledgeSource;
    authorityRequirement: Array<DMN_AuthorityRequirement>;
}

/*export interface DMN_LiteralExpression extends ModdleElement {
    $type: typeof _DMN_LiteralExpression;
    text: string;
    typeRef: _DMN_type_reference;
}*/
export interface DMN_LiteralExpression extends DMN_BaseExpression {
    text: string;
    typeRef: _DMN_type_reference;
}

export interface DMN_OutputClause extends ModdleElement {
    text: string;
    $type: typeof _DMN_OutputClause;
    label: string;
    typeRef: _DMN_type_reference;
}

/*export interface DMN_UnaryTests extends ModdleElement {
    $type: typeof _DMN_UnaryTests;
    text: string;
}*/
/*export interface DMN_UnaryTests extends ModdleElement {
    text: string;
}*/

export interface DMN_UnaryTests extends ModdleElement {
    informationRequirement: any
    $type: typeof _DMN_UnaryTests;
    text: string;
    processUnaryTests: () => string;
    findTableDefiningVariable: (variableName: string, definitions: DMN_Definitions) => ModdleElement | undefined;
    buildTableReference: (table: ModdleElement, level: number) => string;
}


// Interface commune pour les expressions
export interface DMN_BaseExpression extends ModdleElement {
    $type: 'dmn:LiteralExpression' | 'dmn:UnaryTests';
    text: string;
    $children: any;
    id: string;
    name: string;
    $parent: any;
}

export interface TableInfo {
    name: string;
    expressions: string;
}

export interface TableExpressions {
    [tableName: string]: TableInfo;
}