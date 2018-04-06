import { extensions } from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import { Buffer } from 'buffer';

export default class Reporter{
    private reporter:TelemetryReporter

    constructor(private enabled:boolean){
        const extensionId = 'almenon.birdseye-vscode';
        const extension = extensions.getExtension(extensionId)!;
        const extensionVersion = extension.packageJSON.version;

        // following key just allows you to send events to azure insights API
        // so it does not need to be protected
        // but obfuscating anyways - bots scan github for keys, but if you want my key you better work for it, damnit!
        const innocentKitten = Buffer.from('NWYzMWNjNDgtNTA2OC00OGY4LWFjMWMtZDRkY2Y3ZWFhMTM1','base64').toString()
    
        this.reporter = new TelemetryReporter(extensionId, extensionVersion, innocentKitten);
    }

    sendError(exception:string, code:number=0){
        if(this.enabled){
            this.reporter.sendTelemetryEvent('error', {
                'code': code.toString(),
                'exception': exception
            })
        }
    }

    /**
     * we want to collect data on how long the user uses the extension
     * also pythonPath to see if they are using python2 / 3 / virtual env python
     */
    sendFinishedEvent(pythonPath:string, timeSpentSeconds:number){
        if(this.enabled){
            this.reporter.sendTelemetryEvent('closed', {
                'pythonPath': pythonPath,
                'timeSpent':timeSpentSeconds.toString()
            })
        }
    }

    sendDeactivatedEvent(){
        this.reporter.sendTelemetryEvent('deactivated')
    }

    dispose(){this.reporter.dispose()}
}