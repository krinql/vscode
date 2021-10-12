import axios from 'axios';
import { ENDPOINT } from '../config';
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

export function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
    