import * as vscode from 'vscode';

export class EmulatorPanel {
    public static currentPanel: EmulatorPanel | undefined;
    public static readonly viewType = 'apple2tsEmulator';

    private panel: vscode.WebviewPanel | undefined;
    private disposables: vscode.Disposable[] = [];
    private extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
    }

    public createOrShow(context: vscode.ExtensionContext) {
        const column = vscode.window.activeTextEditor
            ? vscode.ViewColumn.Beside
            : vscode.ViewColumn.One;

        if (this.panel) {
            this.panel.reveal(column);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            EmulatorPanel.viewType,
            'Apple IIe Emulator',
            column,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.extensionUri, 'media'),
                    vscode.Uri.joinPath(this.extensionUri, 'media', 'apple2ts'),
                    vscode.Uri.joinPath(this.extensionUri, 'media', 'apple2ts', 'assets'),
                    vscode.Uri.joinPath(this.extensionUri, 'out', 'media')
                ]
            }
        );

        this.update(context);

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.webview.onDidReceiveMessage(
            (message: any) => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showInformationMessage(message.text);
                        return;
                    case 'error':
                        vscode.window.showErrorMessage(message.text);
                        return;
                    case 'emulatorReady':
                        vscode.window.showInformationMessage('Apple2TS Emulator ready');
                        return;
                    case 'programLoaded':
                        if (message.success) {
                            vscode.window.showInformationMessage('Program loaded successfully');
                        } else {
                            vscode.window.showErrorMessage('Failed to load program: ' + message.error);
                        }
                        return;
                    case 'log':
                        console.log('Apple2TS:', message.message);
                        return;
                }
            },
            null,
            this.disposables
        );
    }

    public loadProgram(binary: Uint8Array) {
        if (this.panel) {
            this.panel.webview.postMessage({
                command: 'loadProgram',
                data: Array.from(binary)
            });
        }
    }

    public dispose() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }

        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private update(context: vscode.ExtensionContext) {
        if (this.panel) {
            const webview = this.panel.webview;
            this.panel.webview.html = this.getHtmlForWebview(webview, context);
        }
    }

    private getHtmlForWebview(webview: vscode.Webview, context: vscode.ExtensionContext): string {
        // Get paths to resources
        const scriptPathOnDisk = vscode.Uri.joinPath(this.extensionUri, 'media', 'apple2ts-emulator.js');
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        
        // Get Apple2TS resources
        const apple2tsPath = vscode.Uri.joinPath(this.extensionUri, 'media', 'apple2ts');
        const apple2tsUri = webview.asWebviewUri(apple2tsPath);

        // Use a nonce to only allow specific scripts to be run
        const nonce = this.getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline' ${webview.cspSource}; script-src-elem 'nonce-${nonce}' 'unsafe-inline' ${webview.cspSource}; img-src data: https: ${webview.cspSource}; font-src data: ${webview.cspSource}; media-src ${webview.cspSource}; worker-src 'unsafe-inline' ${webview.cspSource} data: blob:; connect-src ${webview.cspSource}; frame-src ${webview.cspSource}; child-src ${webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Apple2TS Emulator</title>
            <style>
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body {
                    background-color: #1e1e1e;
                    color: #d4d4d4;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    overflow: hidden;
                    width: 100vw;
                    height: 100vh;
                }
                #emulator-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
            </style>
        </head>
        <body>
            <div id="emulator-container"></div>
            <script nonce="${nonce}">
                console.log('🍎 Apple2TS Emulator Loading...');
                
                // Set up Apple2TS base URL for iframe
                window.apple2tsBaseUrl = '${apple2tsUri}';
                
                // Acquire VS Code API once and store it
                try {
                    window.vscode = acquireVsCodeApi();
                    console.log('✅ VS Code API acquired in main script');
                } catch (error) {
                    console.log('⚠️ VS Code API acquisition failed:', error.message);
                }
                
                // Load the simplified emulator script
                const script = document.createElement('script');
                script.src = '${scriptUri}';
                script.onload = () => console.log('✅ Apple2TS emulator script loaded');
                script.onerror = (e) => console.error('❌ Failed to load emulator script:', e);
                document.head.appendChild(script);
            </script>
        </body>
        </html>`;
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}