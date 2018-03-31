import * as vscode from "vscode";
import { spawn, ChildProcess } from "child_process"

/**
 * function taken from Duroktar's Wolf Ext
 * Calls postinstallhook if user accepts prompt and installation is successful
 * @param postInstallHook 
 */
export class birdseye{
  child: ChildProcess;
  running = false;
  exitRequested = false;

  start(port="7777", pythonPath='python'){

    this.exitRequested = false
    this.child = spawn(pythonPath, ["-m", "birdseye", port]);
    this.running = true

    this.child.stderr.on("data", data => {
        data = data.toString()
        console.log(data);

        if(this.hasError(data)){
            vscode.window.showErrorMessage(data + ' Please raise an issue: https://github.com/Almenon/birdseye-vscode/issues')
        }

    });

    this.child.on('error', err => {
        this.running = false
        vscode.window.showErrorMessage("could not start birdseye! error: " + err.message)
        // technically this could also happen if birdseye could not be killed
        // or if sending a message to it failed
        // but we are not sending messages, and we use SIGKILL, so both are unlikely
    })

    this.child.on("exit", code => {
        if(!this.exitRequested){
            vscode.window.showErrorMessage("birdseye exited abnormally! error code: " + code)
            this.running = false
        }
    });

  }

  stop(){
    if(this.running){
        this.exitRequested = true
        this.child.kill('SIGKILL')
        this.running = false
    }
  }

  private hasError(data:string){
    data = data.toLowerCase()
    return !data.startsWith("127.0.0.1") && // anything starting with 127.0.0.1 will just be normal web requests
    (data.includes("traceback (most recent call last)") || data.includes("error") || data.includes("exception"))
  }

}