import * as vscode from 'vscode';
import { EmulatorPanel } from './emulatorPanel';
import { AssemblerService } from './assembler';
import { LanguageFeatures } from './languageFeatures';

let emulatorPanel: EmulatorPanel;
let assemblerService: AssemblerService;
let languageFeatures: LanguageFeatures;

export function activate(context: vscode.ExtensionContext) {
    console.log('Apple2TS Studio extension activated');

    // Initialize services
    emulatorPanel = new EmulatorPanel(context.extensionUri);
    assemblerService = new AssemblerService();
    languageFeatures = new LanguageFeatures();

    // Register language features
    languageFeatures.register(context);

    // Register commands
    const launchEmulatorCommand = vscode.commands.registerCommand('apple2ts.launchEmulator', () => {
        emulatorPanel.createOrShow(context);
    });

    const buildAndRunCommand = vscode.commands.registerCommand('apple2ts.buildAndRun', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active editor found. Please open a 6502 assembly file (.s, .asm, or .a65)');
            return;
        }

        if (activeEditor.document.languageId !== 'asm6502') {
            vscode.window.showWarningMessage('Current file is not a 6502 assembly file. Make sure the file has extension .s, .asm, or .a65');
            return;
        }

        try {
            // Save the file first
            await activeEditor.document.save();
            
            // Assemble the file
            const binary = await assemblerService.assembleFile(activeEditor.document.uri);
            
            // Show emulator and load the program
            emulatorPanel.createOrShow(context);
            emulatorPanel.loadProgram(binary);
            
            vscode.window.showInformationMessage(`Program assembled successfully! ${binary.length} bytes loaded into emulator.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Assembly failed: ${error}`);
            console.error('Assembly error:', error);
        }
    });

    const assembleFileCommand = vscode.commands.registerCommand('apple2ts.assembleFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        if (activeEditor.document.languageId !== 'asm6502') {
            vscode.window.showWarningMessage('Current file is not a 6502 assembly file');
            return;
        }

        try {
            await activeEditor.document.save();
            const binary = await assemblerService.assembleFile(activeEditor.document.uri);
            vscode.window.showInformationMessage(`Assembly successful! Generated ${binary.length} bytes`);
        } catch (error) {
            vscode.window.showErrorMessage(`Assembly failed: ${error}`);
        }
    });

    // Add commands to subscription list
    context.subscriptions.push(
        launchEmulatorCommand,
        buildAndRunCommand,
        assembleFileCommand
    );

    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(play) Apple2TS";
    statusBarItem.command = 'apple2ts.launchEmulator';
    statusBarItem.tooltip = 'Launch Apple IIe Emulator';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

export function deactivate() {
    if (emulatorPanel) {
        emulatorPanel.dispose();
    }
}