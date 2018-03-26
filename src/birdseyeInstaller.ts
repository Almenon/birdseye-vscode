import * as vscode from "vscode";

const { spawn } = require("child_process");

/**
 * Gives user installation prompt
 * Calls postinstallhook if user accepts prompt and installation is successful
 * Or if user says they have installed birdseye manually
 * @param postInstallHook 
 */
export function installBirdseye(postInstallHook: () => void) {
  // function thanks to duroktar - see https://github.com/Duroktar/Wolf/blob/master/src/hunterInstaller.ts

  const installbirdseye: vscode.MessageItem = { title: "Install Package" };
  const installedManually: vscode.MessageItem = { title: "I installed manually" };
  vscode.window
    .showInformationMessage(
      "Birdseye requires the birdseye package. Install now or run 'pip install birdseye --user' manually.",
      installbirdseye, installedManually
    )
    .then(result => {
      if (result === installbirdseye) {
        install(postInstallHook)
      }
      else{
        postInstallHook()
      }
    });

}


function install(postInstallHook: () => void){

  const child = spawn("pip", ["install", "birdseye", "--user"]);

  child.stderr.on("data", data => {
    console.error("INSTALL_ERROR:", data + "");
  });

  child.on("close", code => {
    if (code !== 0) {
      vscode.window.showWarningMessage(
        [
          "There was an error attempting to install birdseye. Please try running",
          "'pip install birdseye --user' manually."
        ].join(" ")
      );
    } else {
      vscode.window.showInformationMessage(
        "birdseye installed successfully. Please close and re-open birdseye"
      );
      postInstallHook();
    }
  });
}