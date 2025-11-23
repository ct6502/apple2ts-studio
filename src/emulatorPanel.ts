import * as vscode from 'vscode'
import * as zlib from 'zlib'

export class EmulatorPanel {
  public static currentPanel: EmulatorPanel | undefined
  public static readonly viewType = 'apple2tsEmulator'

  private panel: vscode.WebviewPanel | undefined
  private disposables: vscode.Disposable[] = []
  private extensionUri: vscode.Uri
  private address = 0x0300
  private binary: Uint8Array = new Uint8Array()
  private format = "bin"
  private runProgram = true
  private outputChannel: vscode.OutputChannel

  constructor(extensionUri: vscode.Uri, outputChannel: vscode.OutputChannel) {
    this.extensionUri = extensionUri
    this.outputChannel = outputChannel
  }

  public createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One

    if (this.panel) {
      this.panel.reveal(column)
    } else {
      this.panel = vscode.window.createWebviewPanel(
        EmulatorPanel.viewType,
        'Apple IIe Emulator',
        column,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      )

      this.panel.onDidDispose(() => this.dispose(), null, this.disposables)

      this.panel.webview.onDidReceiveMessage(
        (message: any) => {
          switch (message.command) {
            case 'alert':
              vscode.window.showInformationMessage(message.text)
              return
            case 'error':
              vscode.window.showErrorMessage(message.text)
              return
            case 'emulatorReady':
              vscode.window.showInformationMessage('Apple2TS Emulator ready')
              return
            case 'programLoaded':
              if (message.success) {
                vscode.window.showInformationMessage('Program loaded successfully')
              } else {
                vscode.window.showErrorMessage('Failed to load program: ' + message.error)
              }
              return
            case 'log':
              console.log('Apple2TS:', message.message)
              return
          }
        },
        null,
        this.disposables
      )
    }

    // This will run whether the panel was created or already existed
    this.update(context)
  }

  public loadProgram(address: number, binary: Uint8Array, format: string) {
    this.address = address
    this.binary = binary
    this.format = format
    // if (this.panel) {
    //   this.panel.webview.postMessage({
    //     command: 'loadProgram',
    //     data: Array.from(binary)
    //   })
    // }
  }

  public dispose() {
    if (this.panel) {
      this.panel.dispose()
      this.panel = undefined
    }

    while (this.disposables.length) {
      const disposable = this.disposables.pop()
      if (disposable) {
        disposable.dispose()
      }
    }
  }

  private update(context: vscode.ExtensionContext) {
    if (this.panel) {
      const webview = this.panel.webview
      this.panel.webview.html = this.getHtmlForWebview(webview, context)
    }
  }

  private getHtmlForWebview(webview: vscode.Webview, context: vscode.ExtensionContext): string {
    // Start with basic URL without binary data
    const baseURL = "localhost:6502" // "apple2ts.com"
    const protocol = baseURL.includes('localhost') ? 'http' : 'https'
    const url = `${protocol}://${baseURL}?appmode=game&theme=dark`
    const origin = `${protocol}://${baseURL}`
    this.outputChannel.appendLine(`URL: ${url}`)
    this.outputChannel.appendLine(`Origin: ${origin}`)

    // Prepare binary data for postMessage
    const dataToSend = this.binary
    const base64Data = Buffer.from(dataToSend).toString('base64')

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Apple2TS Emulator</title>
        <style>
          .emulator-frame {
            width: 100%;
            height: calc(100vh - 40px);
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe 
          class="emulator-frame"
          src="${url}"
          title="Apple2TS Emulator"
          allow="autoplay; clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads">
          <p>Your browser does not support iframes. Please visit <a href="https://apple2ts.com">apple2ts.com</a> directly.</p>
        </iframe>
        
        <script>
          const iframe = document.querySelector('.emulator-frame');
          // Decode base64 back to Uint8Array
          const binaryData = Uint8Array.from(atob('${base64Data}'), c => c.charCodeAt(0));
          
          // Wait for iframe to load, then send binary data
          iframe.onload = function() {
            console.log('Apple2TS iframe loaded, sending binary data...');
            
            // Give the iframe a moment to initialize
            setTimeout(() => {
              iframe.contentWindow.postMessage({
                type: 'loadBinary',
                address: ${this.address},
                format: '${this.format}',
                runProgram: ${this.runProgram},
                data: Array.from(binaryData)
              }, '${origin}');
              
              console.log('Binary data sent to Apple2TS emulator');
            }, 1000);
          };
          
          // Listen for messages from the iframe
          window.addEventListener('message', function(event) {
            if (event.origin === '${origin}') {
              console.log('Message from Apple2TS:', event.data);
              
              // Forward certain messages to VS Code
              if (event.data.type === 'binaryLoaded' || event.data.type === 'error') {
                // These would be sent to VS Code if we had the vscode API available
                console.log('Apple2TS status:', event.data);
              }
            }
          });
        </script>
      </body>
      </html>`
  }
}