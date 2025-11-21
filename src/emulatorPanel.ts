import * as vscode from 'vscode'

export class EmulatorPanel {
  public static currentPanel: EmulatorPanel | undefined
  public static readonly viewType = 'apple2tsEmulator'

  private panel: vscode.WebviewPanel | undefined
  private disposables: vscode.Disposable[] = []
  private extensionUri: vscode.Uri

  constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri
  }

  public createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One

    if (this.panel) {
      this.panel.reveal(column)
      return
    }

    this.panel = vscode.window.createWebviewPanel(
      EmulatorPanel.viewType,
      'Apple IIe Emulator',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    )

    this.update(context)

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

  public loadProgram(binary: Uint8Array) {
    if (this.panel) {
      this.panel.webview.postMessage({
        command: 'loadProgram',
        data: Array.from(binary)
      })
    }
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
          src="https://apple2ts.com?appmode=game&theme=dark"
          title="Apple2TS Emulator"
          allow="autoplay; clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads">
          <p>Your browser does not support iframes. Please visit <a href="https://apple2ts.com">apple2ts.com</a> directly.</p>
        </iframe>
      </body>
      </html>`
  }
}