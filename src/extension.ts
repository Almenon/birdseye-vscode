'use strict';

import * as vscode from 'vscode';
import BirdseyeContentProvider from './BirdseyeContentProvider';
import {birdseye} from './birdseye'

let eye = new birdseye()
let myContext: vscode.ExtensionContext

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    myContext = context

    vscode.workspace.registerTextDocumentContentProvider('Birdseye', new BirdseyeContentProvider());
    let disposablePreview = vscode.commands.registerTextEditorCommand('extension.birdseye.open', Birdseye);
    context.subscriptions.push(disposablePreview);
}

function Birdseye(textEditor: vscode.TextEditor) {

    eye.start()

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
