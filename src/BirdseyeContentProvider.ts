'use strict';

import * as vscode from 'vscode';

export default class BirdseyeContentProvider {
   
    private _onDidChange: vscode.EventEmitter<vscode.Uri>
    private _settings: vscode.WorkspaceConfiguration
    panel: vscode.WebviewPanel

    constructor() {
        this._onDidChange = new vscode.EventEmitter<vscode.Uri>();
        this._settings = vscode.workspace.getConfiguration('birdseye')
    }

    start(){
        this.panel = vscode.window.createWebviewPanel("birdseye","birdseye", vscode.ViewColumn.Two);
        this.panel.webview.html = "Starting birdseye..."
        return this.panel;
    }

    
    /**
     * loads birdseye website
     */
    public onBirdseyeRunning(){
        const port = this._settings.get<number>('port');
        this.panel.webview.html = `
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