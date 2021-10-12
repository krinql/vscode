// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import jwt_decode from 'jwt-decode';
import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';
import { SUPPORT_URL, LOGOUT_URL, FIREBASE_API_KEY } from './config';
import { httpHandler } from './util/util';
import { askQuestion } from './functions/ask';
import { explainCode, explainDocument } from './functions/explain';
import { generateDocstring } from './functions/docstring';
import { SideBarViewProvider } from './sideBar';
import { AccessToken } from './util/types';

// this method is called when the extension is activated
// the extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {	

	let storageManager: vscode.Memento = context.globalState;

	const uriListener = vscode.window.registerUriHandler({
		async handleUri(uri: vscode.Uri) {
			if (uri.path === '/callback') {
				const query = new URLSearchParams(uri.query);
				console.log(uri);
				handleLogin(query.get('token') ?? '', query.get('refreshToken') ?? '');
			}
			else if (uri.path === '/logout') {
				handleLogout();
			}
		}
	});

	const loginProvider = new SideBarViewProvider(context, storageManager, uriListener, 'login');
	const sideBarProvider = new SideBarViewProvider(context, storageManager, uriListener, 'sidebar');
	
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('loginView', loginProvider), 
		vscode.window.registerWebviewViewProvider('sideBarView', sideBarProvider)
	);

	vscode.commands.executeCommand('setContext', 'isAuthed', storageManager.get('token', null) !== null);

	httpHandler.interceptors.request.use(
		async (config) => {
		  config.headers = { 
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Authorization': `Bearer ${storageManager.get('token', null)}`,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json'
		  };
		  return config;
		},
		(error) => {
		  Promise.reject(error);
	  });

	httpHandler.interceptors.response.use((response) => {
		return response;
	  }, async function (error) {
		const originalRequest = error.config;
		if (error?.response?.status === 401 && !originalRequest._retry) {
		  originalRequest._retry = true;
		  const token = await refreshAuthToken();            
		  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
		  return httpHandler(originalRequest);
		}
		return Promise.reject(error);
	  });

	// refresh token update
	const refreshAuthToken = async () => {
		const options: AxiosRequestConfig = {
			method: 'POST',
			baseURL:'https://securetoken.googleapis.com/v1',
			url: 'token',
			params: {key: FIREBASE_API_KEY},
			// eslint-disable-next-line @typescript-eslint/naming-convention
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: {
			  // eslint-disable-next-line @typescript-eslint/naming-convention
			  grant_type: 'refresh_token',
			  // eslint-disable-next-line @typescript-eslint/naming-convention
			  refresh_token: storageManager.get('token')
			}
		};
		  
		  const response = await httpHandler.request(options);
		  if(response.status === 200) {
			  const token = response.data.id_token;
			  const refreshToken = response.data.refresh_token;
			  handleLogin(token, refreshToken);
		  } else {
			vscode.window.showErrorMessage("Authentication Failure");
			handleLogout();
		  }
	};

	function handleLogin(token: string, refreshToken: string) {
		const decodedToken: AccessToken = jwt_decode(token);
		storageManager.update('photo', decodedToken?.picture);
		storageManager.update('name', decodedToken?.name);
		storageManager.update('token', token);
		storageManager.update('refreshToken', refreshToken);
		vscode.commands.executeCommand('setContext', 'isAuthed', true);
	}

	function handleLogout() {
		storageManager.update('token', null);
		storageManager.update('refreshToken', null);
		storageManager.update('photo', null);
		storageManager.update('name', null);
		vscode.commands.executeCommand('setContext', 'isAuthed', false);
	}

	const logout = vscode.commands.registerCommand('krinql-vscode.logout', async () => {
		vscode.env.openExternal(vscode.Uri.parse(LOGOUT_URL));
		handleLogout();
	});

	const support = vscode.commands.registerCommand('krinql-vscode.support', async () => {
		vscode.env.openExternal(vscode.Uri.parse(SUPPORT_URL));
	});

	const ask = vscode.commands.registerCommand('krinql-vscode.ask', async () => askQuestion(httpHandler));

	const explaindocument = vscode.commands.registerCommand('krinql-vscode.explaindocument', async () => explainDocument(httpHandler));

	const explain = vscode.commands.registerCommand('krinql-vscode.explain', async () => explainCode(httpHandler));

	const createDocstring = vscode.commands.registerCommand('krinql-vscode.docstring', async () => generateDocstring(httpHandler));

	context.subscriptions.push(
		explain, ask, explaindocument, logout, support,
		createDocstring, uriListener 
	);
	
}

// this method is called when the extension is deactivated
export function deactivate() {}
