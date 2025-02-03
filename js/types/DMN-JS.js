export function Set_current_diagram(diagram, data) {
    // Le diagramme courant est placé dans l'historique du navigateur :
    window.history.replaceState({
        data: data,
        diagram: diagram
    }, "");
}
export const _DMN_AuthorityRequirement = 'dmn:AuthorityRequirement';
export const _DMN_BusinessKnowledgeModel = 'dmn:BusinessKnowledgeModel';
export const _DMN_Decision = 'dmn:Decision';
export const _DMN_DecisionRule = 'dmn:DecisionRule';
export const _DMN_DecisionTable = 'dmn:DecisionTable';
export const _DMN_Definitions = 'dmn:Definitions';
export const _DMN_DMNElementReference = 'dmn:DMNElementReference';
export const _DMN_InformationItem = 'dmn:InformationItem';
export const _DMN_InformationRequirement = 'dmn:InformationRequirement';
export const _DMN_InputClause = 'dmn:InputClause';
export const _DMN_InputData = 'dmn:InputData';
export const _DMN_KnowledgeRequirement = 'dmn:KnowledgeRequirement';
export const _DMN_KnowledgeSource = 'dmn:KnowledgeSource';
export const _DMN_LiteralExpression = 'dmn:LiteralExpression';
export const _DMN_OutputClause = 'dmn:OutputClause';
export const _DMN_UnaryTests = 'dmn:UnaryTests';
export function is_DMN_Decision(me) {
    return '$type' in me && me.$type === _DMN_Decision && 'decisionLogic' in me;
}
export function is_DMN_Definitions(me) {
    return '$type' in me && me.$type === _DMN_Definitions && 'drgElement' in me;
}
export function is_DMN_DecisionTable(me) {
    return '$type' in me && me.$type === _DMN_DecisionTable && 'input' in me && 'rule' in me;
}
export function is_DMN_InformationRequirement(me) {
    return '$type' in me && me.$type === _DMN_InformationRequirement && 'requiredInput' in me;
}
export function is_DMN_InputData(me) {
    return '$type' in me && me.$type === _DMN_InputData;
}
//# sourceMappingURL=DMN-JS.js.map