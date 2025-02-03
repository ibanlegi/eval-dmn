# Project Evaluation and Visualization of DMN Models

### Licence 3 Informatique - Modules Conception Application Internet (CAI) / Technologie Orientée Objet (TOO)  
### Université de Pau et des Pays de l'Adour  
### December 2023

## Table of Contents
1. [Objective](#objective)
2. [Working Folder](#working-folder)
3. [Edit a DMN Diagram](#edit-a-dmn-diagram)
4. [Using the Application](#using-the-application)
5. [Tools and Extensions Used](#tools-and-extensions-used)

---

> **Note** : The project documentation is written in French.

## Objective

This project allows loading and visualizing DMN (Decision Model and Notation) files through a web interface. It supports the evaluation of rules defined in FEEL (Friendly Enough Expression Language) based on input JSON files.

---

## Working Folder

A working folder has been created :
- [Working Folder [PDF]](./Dossier_Projet.pdf)

---

## Edit a DMN Diagram

You can edit your own diagrams via [bpmn.io](https://demo.bpmn.io/dmn).  
Create your test files in JSON format.

---

## Using the Application

The project is ready to use, and all the files have been compiled correctly. You can try it directly by opening `index.html` and using the (`.dmn` and `.json`) files provided in the `./test_files` folder. Files that generate errors and allow for testing if they are correctly detected are also present.

The user must load (via drag and drop or through the file explorer) the DMN file into the “Visualized DMN File” area and the JSON file into the “JSON File” area.  
The JSON file must provide input data corresponding to the input data of the DMN diagram.  
The name of an input variable must match the name of the input expression in the column of the table processing the input data.

Once the files are provided, the user can visualize the diagram and evaluate it (using the button).  
During the evaluation, a FEEL expression is generated from the diagram in the method `fileDmn.handlingFeelinExpression()`, and its syntax is as follows :

```text
if((var1 in conditions1) and (var2 in conditions2)) then output1 else "Error"
```

For example, for the AgeClassification table, the expression is :
```text
if ((age in <13)) then "Child" else if ((age in [13..65))) then "Adult" else if ((age in >=65)) then "Senior" else "Error"
```

--- 

## Tools and Extensions Used
This project relies on several tools and extensions that made the development process smoother and more efficient:

- **[bpmn.io](https://demo.bpmn.io/dmn)** : An open-source web tool for editing DMN diagrams. For more details, see the [bpmn.io License](https://bpmn.io/license/).
- **[FEEL (Friendly Enough Expression Language)](https://camunda.github.io/feel-scala/docs/reference)** : The language used to evaluate expressions in the DMN model. For more details, see the [feel-scala Licence](https://github.com/camunda/feel-scala/blob/main/LICENSE).
- **[Webpack](https://webpack.js.org/)** : A popular JavaScript module bundler, used to bundle JavaScript files, manage dependencies, and optimize the assets of the project. For more details, see the [Webpack License](https://webpack.js.org/license). 

*December 2023*
