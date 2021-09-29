// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';
import { LOGIN_URL, LOGOUT_URL, FIREBASE_API_KEY } from './config';
import { httpHandler } from './util/util';
import { askQuestion } from './functions/ask';
import { explainCode, explainDocument } from './functions/explain';
import { generateDocstring } from './functions/docstring';


// this method is called when the extension is activated
// the extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {	

	let storageManager: vscode.Memento = context.globalState;

	vscode.commands.executeCommand('setContext', 'isAuthed', storageManager.get('accessToken', null) !== null);

	// Request interceptor
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

	// Response Interceptor
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
			  storageManager.update('token', token);
			  storageManager.update('refresh_token', refreshToken);
		  } else {
			vscode.window.showErrorMessage("Authentication Failure");
			storageManager.update('accessToken', null);
			storageManager.update('refreshToken', null);
			vscode.commands.executeCommand('setContext', 'isAuthed', false);
		  }
	};

	const uriListener = vscode.window.registerUriHandler({
		async handleUri(uri: vscode.Uri) {
			if (uri.path === '/callback') {
				const query = new URLSearchParams(uri.query);
				console.log(uri);
				vscode.commands.executeCommand('setContext', 'isAuthed', true);
				storageManager.update('token', query.get('token'));
				storageManager.update('refreshToken', query.get('refreshToken'));
			}
			else if (uri.path === '/logout') {
				storageManager.update('token', null);
				storageManager.update('refreshToken', null);
				vscode.commands.executeCommand('setContext', 'isAuthed', false);
			}
		}
	});

	const login = vscode.commands.registerCommand('krinql-vscode.login', async () => {
		vscode.env.openExternal(vscode.Uri.parse(LOGIN_URL));
	});

	const logout = vscode.commands.registerCommand('krinql-vscode.logout', async () => {
		vscode.env.openExternal(vscode.Uri.parse(LOGOUT_URL));
	});

	const ask = vscode.commands.registerCommand('krinql-vscode.ask', async () => askQuestion(httpHandler));

	const explaindocument = vscode.commands.registerCommand('krinql-vscode.explaindocument', async () => explainDocument(httpHandler));

	const explain = vscode.commands.registerCommand('krinql-vscode.explain', async () => explainCode(httpHandler));

	const createDocstring = vscode.commands.registerCommand('krinql-vscode.docstring', async () => generateDocstring(httpHandler));

	context.subscriptions.push(
		login, logout, explain, ask, explaindocument,
		createDocstring, uriListener 
	);
	
}

// this method is called when the extension is deactivated
export function deactivate() {}
