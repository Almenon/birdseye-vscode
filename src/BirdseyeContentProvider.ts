'use strict';

import * as vscode from 'vscode';

export default class BirdseyeContentProvider implements vscode.TextDocumentContentProvider {
   
    private _onDidChange: vscode.EventEmitter<vscode.Uri>;
    private _settings: vscode.WorkspaceConfiguration

    constructor() {
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
        this._settings = vscode.workspace.getConfiguration('birdseye')
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        const port = this._settings.get('port');
        return `
            <html> <!-- iframe html thanks to https://github.com/negokaz/vscode-live-server-preview -->
                <header>
                    <style>
                        body, html, div {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            overflow: hidden;
                            background-color: #fff;
                        }
                    </style>
                </header>
                <body>
                    <div>
                        <iframe src="http://127.0.0.1:${port}" width="100%" height="100%" seamless frameborder=0>
                        </iframe>
                    </div>
                </body>
            </html>
        `;
    }
}