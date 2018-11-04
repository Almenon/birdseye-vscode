'use strict';

import * as vscode from 'vscode';
import BirdseyeContentProvider from './BirdseyeContentProvider';
import {birdseye} from './birdseye'
import * as birdseyeInstaller from './birdseyeInstaller'
import Reporter from './telemetry'
import { EOL } from 'os';

const needToUpdateMsg = "The package birdseye is out of date"

let eye = new birdseye()
let myContext: vscode.ExtensionContext
let settings: vscode.WorkspaceConfiguration
let eyeContent: BirdseyeContentProvider
let reporter: Reporter
let timeStarted:number

// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    myContext = context

    let disposablePreview = vscode.commands.registerCommand('extension.birdseye.open', Birdseye);
    context.subscriptions.push(disposablePreview);
}

function Birdseye() {
    timeStarted = Date.now()
    settings = vscode.workspace.getConfiguration('birdseye')
    reporter = new Reporter(settings.get<boolean>('telemetry'))
    eyeContent = new BirdseyeContentProvider()
    
    setupEye(onEyeRunning.bind(this))

    eyeContent.start()

    function onEyeRunning(){
        eyeContent.onBirdseyeRunning()
        eyeContent.panel.onDidDispose(dispose)
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
        else if(data.includes("Running") || data.includes("Debugger is active")){
            onEyeRunning()
        }

        if(data.includes(needToUpdateMsg)){
            const lines = data.split(EOL)

            // find line with update message and show it to user
            for(const line of lines){
                if(line.includes(needToUpdateMsg)){
                    // get rid of ugly path before needToUpdateMsg
                    let niceLine = line.slice(line.indexOf(needToUpdateMsg))
                    birdseyeInstaller.upgradeBirdseye(niceLine, ()=>{})
                }
            }
        }
    });
    eye.child.on('error', err => {
        // technically this could also happen if birdseye could not be killed
        // or if sending a message to it failed
        vscode.window.showErrorMessage("could not start birdseye! error: " + err.message)
        reporter.sendError(err.message)
    })
    eye.child.on("exit", code => {
        if(!eye.exitRequested && birdseyeInstalled){
            vscode.window.showErrorMessage(`birdseye exited due to an error :( error code: ${code} Exception: ${eye.exception}
                Please raise an issue: https://github.com/Almenon/birdseye-vscode/issues`)
        }
        reporter.sendError(eye.exception, code)
    });
}

function dispose(){
    
    let timeSpentSeconds = (Date.now()-timeStarted)/1000
    reporter.sendFinishedEvent(settings.get<string>("pythonPath"), timeSpentSeconds)
    reporter.dispose()
    
    eye.stop()
}

export function deactivate() {
    reporter.sendDeactivatedEvent()
    dispose()
}
