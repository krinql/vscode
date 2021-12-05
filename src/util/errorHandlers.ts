import * as vscode from 'vscode';
import { LOGIN_URL } from '../config';
import {certConfigHack} from './certErrorHotfix';
export async function handleNoResponse(err: any): Promise<void> {
    if (!err.response) {
        if(err.name === "auth/no-token"){
            vscode.window.showWarningMessage("Please login to your Krinql account.", 'Login')
            .then(selection => {
                if (selection === 'Login') {
                    vscode.env.openExternal(vscode.Uri.parse(LOGIN_URL));
                }
              });
        }
        else if(err?.message?.includes("certificate has expired")){
            console.log("Attempting to fix certificate error");
            // Bugfix Patch/Hack for electron certificate error
        	// See https://github.com/krinql/vscode/issues/1
	        // and https://github.com/microsoft/vscode/issues/136787
            await certConfigHack();
        } 
        else {
        vscode.window.showErrorMessage(`Error Contacting API ${err?.message}`);
        }  
    }
}