import axios from 'axios';
import { BACKEND_ENDPOINT, LOGIN_URL, LOGOUT_URL } from './../config';
import * as vscode from 'vscode';


 
export const httpHandler = axios.create({
    baseURL: `${BACKEND_ENDPOINT}/api`,
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
