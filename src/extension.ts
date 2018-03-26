'use strict';

import * as vscode from 'vscode';
import BirdseyeContentProvider from './BirdseyeContentProvider';
import {birdseye} from './birdseye'

let eye = new birdseye()
let myContext: vscode.ExtensionContext
let settings: vscode.WorkspaceConfiguration

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    settings = vscode.workspace.getConfiguration('birdseye')
    myContext = context

    vscode.workspace.registerTextDocumentContentProvider('Birdseye', new BirdseyeContentProvider());
    let disposablePreview = vscode.commands.registerTextEditorCommand('extension.birdseye.open', Birdseye);
    context.subscriptions.push(disposablePreview);
}

function Birdseye(textEditor: vscode.TextEditor) {

    eye.start(settings.get('port'), settings.get<string>("pythonPath"))

    const previewUri = vscode.Uri.parse(`Birdseye://authority/preview`);

    vscode.commands
            .executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two)
            .then(s => console.log('previewHtml done'), vscode.window.showErrorMessage);

    let textDocDispose = vscode.workspace.onDidCloseTextDocument((doc)=>{
        if(doc.uri.scheme == previewUri.scheme) eye.stop()
    })

    myContext.subscriptions.push(textDocDispose)
}


export function deactivate() {
    eye.stop()
}
