import * as vscode from 'vscode';

export const ENDPOINT = "https://krinql.com";
export const FIREBASE_API_KEY = "AIzaSyCDkSplsCexKg1Pn_4LtXqKiSNafXAs4zE";

export const LOGIN_URL = `${ENDPOINT}/auth/external/${vscode.env.uriScheme}/login`;
export const LOGOUT_URL = `${ENDPOINT}/auth/external/${vscode.env.uriScheme}/logout`;
export const SUPPORT_URL = `${ENDPOINT}/`;




