import { AxiosInstance } from 'axios';
import * as vscode from 'vscode';
import { handleNoResponse } from '../util/errorHandlers';

export async function askQuestion(httpHandler: AxiosInstance) {
    const question = await vscode.window.showInputBox(
        {title: 'Ask a question', placeHolder: 'Question'}
    );

    if (!question) {
        return;
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Please wait for answer',
        cancellable: true,
    }, () => {
        return new Promise(async (resolve, reject) => {
            if (vscode.window.activeTextEditor?.selection) {
                try {
                    const askRes = await httpHandler.post(`openai`, {
                        params: {
                            inputQuestion: question
                        },
                        template: 'factualAnswering'
                    });
                    const output  = askRes.data.data[0];
                    console.log( {output} );
                    vscode.window.showInformationMessage(output, 'Copy')
                    .then(selection => {
                        if (selection === 'Copy') {
                          vscode.env.clipboard.writeText(output);
                        }
                      });
                    resolve(output);
                } catch (err: any) {
                    console.log({err});
                    if (!err.response) {
                        await handleNoResponse(err);             
                        reject("Error Contacting API");
                    }else{
                    vscode.window.showErrorMessage(err?.response?.data?.message || err?.code);
                    reject(err?.response?.data?.message || err?.code);
                  }
                }
            }
        });
    });
}