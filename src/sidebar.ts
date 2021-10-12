import * as vscode from 'vscode';
import { getSidebarHTML } from './sidebar/pageTemplates';
import { getNonce } from './util/util';


export class SideBarViewProvider implements vscode.WebviewViewProvider {

  private readonly _extensionUri: vscode.Uri;
  private readonly _storageManager: vscode.Memento;
  private readonly _uriListener: vscode.Disposable;
  private readonly _pageName: string;
  public  _view?: vscode.WebviewView;

  constructor(context: vscode.ExtensionContext, storageManager: vscode.Memento, uriListener: vscode.Disposable, pageName: string) { 
    this._extensionUri = context.extensionUri;
    this._storageManager = storageManager;
    this._uriListener = uriListener;
    this._pageName = pageName;
    
  }


  public resolveWebviewView(
    webviewView: vscode.WebviewView, 
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
    ) {
      this._view = webviewView;

      webviewView.webview.options = {
        // Allow scripts in the webview
        enableScripts: true,
        localResourceRoots: [
          this._extensionUri
        ]
      };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, this._pageName, this._storageManager);
  }

  //To pass messages from vscode context to sidebar page
  public sendMessage(type: string, data: any) {
    if (this._view) {
      this._view.show?.(true);
      this._view.webview.postMessage({ type, data });
    }
  }


  private _getHtmlForWebview(webview: vscode.Webview, pageName: string, storageManager: vscode.Memento) : string{
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'sidebar_assets', 'main.js'));

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'sidebar_assets', 'reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'sidebar_assets', 'vscode.css'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'sidebar_assets', 'main.css'));

    const krinqlLogoUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'sidebar_assets', 'logo.png'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    const props = {webview, nonce, styleResetUri, styleVSCodeUri, styleMainUri, scriptUri, pageName, storageManager, krinqlLogoUri};

    return getSidebarHTML(props);
  }
}

