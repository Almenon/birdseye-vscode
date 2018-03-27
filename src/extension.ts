'use strict';

import * as vscode from 'vscode';
import BirdseyeContentProvider from './BirdseyeContentProvider';
import {birdseye} from './birdseye'

let eye = new birdseye()
let myContext: vscode.ExtensionContext
let settings: vscode.WorkspaceConfiguration
import * as birdseyeInstaller from './birdseyeInstaller'

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    settings = vscode.workspace.getConfiguration('birdseye')
    myContext = context

    vscode.workspace.registerTextDocumentContentProvider('Birdseye', new BirdseyeContentProvider());
    let disposablePreview = vscode.commands.registerCommand('extension.birdseye.open', Birdseye);
    context.subscriptions.push(disposablePreview);
}

function Birdseye(textEditor: vscode.TextEditor) {

    const previewUri = vscode.Uri.parse(`Birdseye://authority/preview`);
    
    function onEyeRunning(){
        vscode.commands
                .executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two)
                .then(s => console.log('previewHtml done'), vscode.window.showErrorMessage);
    
                let textDocDispose = vscode.workspace.onDidCloseTextDocument((doc)=>{
                    if(doc.uri.scheme == previewUri.scheme) eye.stop()
                })
                
                myContext.subscriptions.push(textDocDispose)
    }
            
    setupEye(onEyeRunning.bind(this))
}

function setupEye(onEyeRunning = ()=>{}){
    eye.start(settings.get('port'), settings.get<string>("pythonPath"))
    let birdseyeInstalled = true

    eye.child.stderr.on("data", data => {
        // oddly enough birdseye seems to log everything to stderr....
        // birdseye will log the following upon start:
        /* 
            * Restarting with stat
            * Debugger is active!
            * Debugger PIN: XXX-XXX-XXX
            * Running on http://127.0.0.1:XXXX/ (Press CTRL+C to quit)
            * 
        */
       
        data = data.toString()
        console.log(data);
        if(data.includes("No module named birdseye")){
            birdseyeInstalled = false
            birdseyeInstaller.installBirdseye(()=>{
                birdseyeInstalled = true
            })
        }
        else if(data.includes("Running")){
            onEyeRunning()
        }
    });
    eye.child.on('error', err => {
        vscode.window.showErrorMessage("could not start birdseye! error: " + err.message)
        // technically this could also happen if birdseye could not be killed
        // or if sending a message to it failed
        // but we are not sending messages, and we use SIGKILL, so both are unlikely
    })
    eye.child.on("exit", code => {
        if(!eye.exitRequested && birdseyeInstalled){
            vscode.window.showErrorMessage("birdseye exited abnormally! error code: " + code)
        }
    });
}

export function deactivate() {
    eye.stop()
}
