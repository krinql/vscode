import { workspace, ConfigurationTarget } from 'vscode';
import * as vscode from 'vscode';

export async function certConfigHack(): Promise<void> {
	// See https://github.com/krinql/vscode/issues/1
	// and https://github.com/microsoft/vscode/issues/136787
	if (workspace.getConfiguration('http').get<boolean>('systemCertificates')) {
		// Set a sentinel so that we know that we set it rather than the user, and thus we can revert it later.
		await workspace.getConfiguration('krinql-vscode').update('httpSystemCertificatesHotFix', true, ConfigurationTarget.Global);
		await workspace.getConfiguration('http').update('systemCertificates', false, ConfigurationTarget.Global);
		// Setting docs say that a window reload is required for it to take effect.
		vscode.window.showInformationMessage('Attempting to apply patch for SSL Error, Window will reload');
		await vscode.commands.executeCommand('workbench.action.reloadWindow');
	}
	// Already tried applying the hack and it didn't work, so give up.
}