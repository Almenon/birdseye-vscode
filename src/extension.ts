'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import BirdseyeContentProvider from './BirdseyeContentProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.registerTextDocumentContentProvider('Birdseye', new BirdseyeContentProvider());
    let disposablePreview = vscode.commands.registerTextEditorCommand('extension.birdseye.open', Birdseye);
    context.subscriptions.push(disposablePreview);
}

function Birdseye(textEditor: vscode.TextEditor) {

    // todo: start birdseye

    const previewUri = vscode.Uri.parse(`Birdseye://authority/preview`);

    vscode.commands
            .executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two)
            .then(s => console.log('previewHtml done'), vscode.window.showErrorMessage);

    vscode.workspace.onDidCloseTextDocument((doc)=>{
        if(doc.uri == previewUri) closeBirdseye()
    })
}

function closeBirdseye(){
    let birdseyeIsRunning = true; //todo: implement
    if(birdseyeIsRunning){
        // birdseye.close()
        console.log('closed birdseye')
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
    closeBirdseye()
}
