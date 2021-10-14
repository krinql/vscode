import { AxiosInstance } from 'axios';
import * as vscode from 'vscode';
import { getInsert, getSelectedText } from '../util/util';
import { Commentifier } from '../util/comments';

let commentify = new Commentifier().commentify;

export async function explainDocument(httpHandler: AxiosInstance) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Please wait for explanation',
        cancellable: true,
    }, () => {
        return new Promise(async (resolve, reject) => {
            if (vscode.window.activeTextEditor?.selection) {
                const highlight = vscode.window.activeTextEditor.document.getText();
                const insert = new vscode.Position(0, 0);

                try {
                    const explainRes = await httpHandler.post(`openai`, {
                        params: {
                            inputCode: highlight,
                        },
                        template: 'codeExplain'
                    });
                    const output = explainRes.data.data;
                    const explanationWithComment = commentify("Here's what the selected code is doing:\n1."+output[0], vscode.window.activeTextEditor.document.fileName); 
                    vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(`${explanationWithComment}\n`), insert);
                    resolve('Added explanation');
                } catch (err: any) {
                    console.log({err});
                    if(!err.response) {
                        vscode.window.showErrorMessage(`Error Contacting API ${err?.message}`);
                        reject("Error Contacting API");
                    }else{
                    vscode.window.showErrorMessage(err.response.data.message);
                    reject(err.response.data.message);
                    }
                }
            } else {
                reject('Please select some text to explain');
            }
        });
    });
}

export async function explainCode(httpHandler: AxiosInstance) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Please wait for explanation',
        cancellable: true,
    }, () => {
        return new Promise(async (resolve, reject) => {
            if (vscode.window.activeTextEditor?.selection) {
                const highlight = getSelectedText(vscode.window.activeTextEditor);
                const insert = getInsert(vscode.window.activeTextEditor);

                try {
                    const explainRes = await httpHandler.post(`openai`, {
                        params: {
                            inputCode: highlight,
                        },
                        template: 'codeExplain'
                      });
                    const output = explainRes.data.data;
                    const explanationWithComment = commentify("Here's what the selected code is doing:\n1."+output[0], vscode.window.activeTextEditor.document.fileName); 
                    vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(`${explanationWithComment}\n`), insert);
                    resolve('Added explanation');
                } catch (err: any) {
                    console.log({err});
                    if (!err.response) {
                        vscode.window.showErrorMessage(`Error Contacting API ${err?.message}`);
                        reject("Error Contacting API");
                    } else {
                    vscode.window.showErrorMessage(err.response.data.message);
                    reject(err.response.data.message);
                    }
                }
            } else {
                reject('Please select some text to explain');
            }
        });
    });
}