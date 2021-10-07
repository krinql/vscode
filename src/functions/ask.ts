import { AxiosInstance } from 'axios';
import * as vscode from 'vscode';
import { cleanOutputQnA } from '../util/util';

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
                    const output  = cleanOutputQnA(askRes.data.data[0]);
                    console.log( {output} );
                    //replaceTokens(newRefreshToken, newAccessToken);
                    vscode.window.showInformationMessage(output);
                    resolve(output);
                } catch (err: any) {
                    console.log({err});
                    if (!err.response) {
                        console.log({err});
                        vscode.window.showErrorMessage("Error Contacting API");
                        reject("Error Contacting API");
                    }else{
                    vscode.window.showErrorMessage(err.response.data.message);
                    reject(err.response.data.message);
                  }
                }
            }
        });
    });
}