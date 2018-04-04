'use strict';

import * as vscode from 'vscode';
import BirdseyeContentProvider from './BirdseyeContentProvider';
import {birdseye} from './birdseye'
import * as birdseyeInstaller from './birdseyeInstaller'

let eye = new birdseye()
let myContext: vscode.ExtensionContext
let settings: vscode.WorkspaceConfiguration
let eyeContent: BirdseyeContentProvider

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    settings = vscode.workspace.getConfiguration('birdseye')
    myContext = context
    eyeContent = new BirdseyeContentProvider()

    vscode.workspace.registerTextDocumentContentProvider('Birdseye', eyeContent);
    let disposablePreview = vscode.commands.registerCommand('extension.birdseye.open', Birdseye);
    context.subscriptions.push(disposablePreview);
}

function Birdseye() {

    setupEye(onEyeRunning.bind(this))

    const previewUri = vscode.Uri.parse(BirdseyeContentProvider.PREVIEW_URI);
    vscode.commands
            .executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two)
            .then(s => console.log('previewHtml done'), vscode.window.showErrorMessage);

    function onEyeRunning(){
        eyeContent.onBirdseyeRunning()

        let textDocDispose = vscode.workspace.onDidCloseTextDocument((doc)=>{
            if(doc.uri.scheme == previewUri.scheme) eye.stop()
        })
        
        myContext.subscriptions.push(textDocDispose)
    }
            
}

function setupEye(onEyeRunning = ()=>{}){
    eye.start(settings.get('port'), settings.get<string>("pythonPath"))
    let birdseyeInstalled = true

    eye.child.stderr.on("data", data => {
        // we also recieve logs on stderr
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
