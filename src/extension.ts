import * as vscode from "vscode"
import { EmulatorPanel } from "./emulatorPanel"
import { AssemblerService } from "./assembler"
import { LanguageFeatures } from "./languageFeatures"
import * as fs from "fs"

let emulatorPanel: EmulatorPanel
let assemblerService: AssemblerService
let languageFeatures: LanguageFeatures

export function activate(context: vscode.ExtensionContext) {
  console.log("Apple2TS Studio extension activated")

  // Initialize services
  const outputChannel = vscode.window.createOutputChannel("Apple2TS Assembler")
  emulatorPanel = new EmulatorPanel(context.extensionUri, outputChannel)
  assemblerService = new AssemblerService(outputChannel)
  languageFeatures = new LanguageFeatures()

  // Register language features
  languageFeatures.register(context)

  // Register commands
  const launchEmulatorCommand = vscode.commands.registerCommand("apple2ts.launchEmulator", () => {
    emulatorPanel.createOrShow(context, false)
  })

  const buildAndRunAssemblyCommand = vscode.commands.registerCommand("apple2ts.buildAndRunAssembly", async () => {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) {
      vscode.window.showWarningMessage("No active editor found. Please open a 6502 assembly file (.s, .asm, or .a65)")
      return
    }

    if (activeEditor.document.languageId !== "apple2ts6502Assembly") {
      vscode.window.showWarningMessage("Current file is not a 6502 assembly file. Make sure the file has extension .s, .asm, or .a65")
      return
    }

    try {
      // Save the file first
      await activeEditor.document.save()
      
      // Assemble the file
      const [address, binary] = await assemblerService.assembleFile(activeEditor.document.uri)
      
      // Show emulator and load the program
      emulatorPanel.loadAssemblyProgram(address, binary, "bin")
      emulatorPanel.createOrShow(context, true)
      
      vscode.window.showInformationMessage(`Program assembled successfully! ${binary.length} bytes loaded into emulator.`)
    } catch (error) {
      vscode.window.showErrorMessage(`Assembly failed: ${error}`)
      console.error("Assembly error:", error)
    }
  })

  const assembleFileCommand = vscode.commands.registerCommand("apple2ts.assembleFile", async () => {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) {
      vscode.window.showWarningMessage("No active editor found")
      return
    }

    if (activeEditor.document.languageId !== "apple2ts6502Assembly") {
      vscode.window.showWarningMessage("Current file is not a 6502 assembly file")
      return
    }

    try {
      await activeEditor.document.save()
      const [address, binary] = await assemblerService.assembleFile(activeEditor.document.uri)
      vscode.window.showInformationMessage(`Assembly successful! Generated ${binary.length} bytes`)
    } catch (error) {
      vscode.window.showErrorMessage(`Assembly failed: ${error}`)
    }
  })

  const buildAndRunBasicCommand = vscode.commands.registerCommand("apple2ts.buildAndRunBasic", async () => {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) {
      vscode.window.showWarningMessage("No active editor found. Please open a BASIC file (.bas)")
      return
    }

    if (activeEditor.document.languageId !== "apple2ts6502Basic") {
      vscode.window.showWarningMessage("Current file is not a BASIC file. Make sure the file has extension .bas")
      return
    }

    try {
      // Save the file first
      await activeEditor.document.save()

      // Read file content as string
      const source = await fs.promises.readFile(activeEditor.document.uri.fsPath, "utf8")
      
      // Show emulator and load the program
      emulatorPanel.loadBasicProgram(source)
      emulatorPanel.createOrShow(context, false)
      
      vscode.window.showInformationMessage(`Program run successfully! ${source.length} bytes loaded into emulator.`)
    } catch (error) {
      vscode.window.showErrorMessage(`Assembly failed: ${error}`)
      console.error("Assembly error:", error)
    }
  })

  let disposable = vscode.commands.registerCommand("apple2ts.gotoline", () => {
    
		vscode.window.showInputBox({
        prompt: 'Type a BASIC line number to go to.'
    })
    .then(line => {
			if (!line) { return; }
			let editor = vscode.window.activeTextEditor;
			if (!editor) { return; }

      const regex = RegExp(`^${line}\\b`)
      const lines = editor.document.getText().split("\n");
      for (let i=0; i<lines.length; i++) {
        if (regex.test(lines[i])) {
          let range = editor.document.lineAt(i).range;
          editor.selection = new vscode.Selection(range.start, range.start);
          editor.revealRange(range);
          break
        }
      }
		});
	});
	context.subscriptions.push(disposable);

  // Add commands to subscription list
  context.subscriptions.push(
    launchEmulatorCommand,
    buildAndRunAssemblyCommand,
    assembleFileCommand,
    buildAndRunBasicCommand
  )

  // Register status bar item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusBarItem.text = "$(play) Apple2TS"
  statusBarItem.command = "apple2ts.launchEmulator"
  statusBarItem.tooltip = "Launch Apple2TS Emulator"
  statusBarItem.show()
  context.subscriptions.push(statusBarItem)

  // Remove line numbers for BASIC
  vscode.workspace
    .getConfiguration()
    .update("editor.lineNumbers", "off", vscode.ConfigurationTarget.Global);
}

export function deactivate() {
  if (emulatorPanel) {
    emulatorPanel.dispose()
  }
}