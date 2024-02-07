import * as vscode from 'vscode';


export interface HTMLProps {
    webview: vscode.Webview;
    nonce: string;
    styleResetUri: vscode.Uri;
    styleVSCodeUri: vscode.Uri;
    styleMainUri: vscode.Uri;
    scriptUri: vscode.Uri;
    pageName: string;
    storageManager: vscode.SecretStorage;
    krinqlLogoUri: vscode.Uri;
}

export interface AccessToken {
    name: string;
    picture: string;
    email: string;


}