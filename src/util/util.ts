import axios from 'axios';
import {ENDPOINT} from './../config';
import * as vscode from 'vscode';


 
export const httpHandler = axios.create({
    baseURL: `${ENDPOINT}/api`,
    timeout: 25000,
});

export const getSelectedText = (editor: vscode.TextEditor): string => {
    const highlightedText = editor.document.getText(new vscode.Range(editor.selection.start, editor.selection.end));
    return highlightedText;
};

export const getInsert = (editor: vscode.TextEditor): vscode.Position => {
    const insertPos = new vscode.Position(editor.selection.start.line, editor.document.lineAt(editor.selection.start.line).firstNonWhitespaceCharacterIndex);
    return insertPos;
};

export const cleanOutputQnA = (output:string): string => {
    output = output.search("\n\nQ:")!==-1 ? output.split("\n\nQ:")[0] : output;
    output = output.search("\nA:")!==-1 ? output.split("\nA:")[0] : output; 
    return output;
}