import { AxiosInstance } from 'axios';
import * as vscode from 'vscode';
import { getInsert, getSelectedText } from '../util/util';
import { Commentifier } from '../util/comments';

let commentify = new Commentifier().commentify;

export async function generateDocstring(httpHandler: AxiosInstance) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Please wait for docstring to be generated',
        cancellable: true,
    }, () => {
        return new Promise(async (resolve, reject) => {
            if (vscode.window.activeTextEditor?.selection) {
                const highlight = getSelectedText(vscode.window.activeTextEditor);
                const insert = getInsert(vscode.window.activeTextEditor);

                try {
                    const docstringRes = await httpHandler.post(`openai`, {
                        params: {
                            inputLang: vscode.window.activeTextEditor.document.languageId,
                            inputCode: highlight,
                        },
                        template: 'docString'
                    });

                    const output = docstringRes.data.data;
                    console.log({output});
                    const docstringWithComment = commentify(output[0], vscode.window.activeTextEditor.document.fileName); 
                    vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(`${docstringWithComment}\n`), insert);
                    resolve('Added docstring');
                } catch (err: any) {
                    console.log({err});
                    if (!err.response) {
                        vscode.window.showErrorMessage(`Error Contacting API ${err?.message}`);
                        reject("Error Contacting API");
                    }else{
                    vscode.window.showErrorMessage(err.response.data.message);
                    reject(err.response.data.message);
                    }
                }
            } else {
                reject('Please select some text to generate docstring');
            }
        });
    });
}