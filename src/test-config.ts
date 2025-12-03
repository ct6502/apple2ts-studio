import * as vscode from "vscode";

// Simple test to verify configuration is accessible
export function testConfiguration() {
    const config = vscode.workspace.getConfiguration("apple2ts");
    
    console.log("Testing configuration access:");
    console.log("assembler6502:", config.get("assembler6502"));
    console.log("assembler.tassPath:", config.get("assembler.tassPath"));
    console.log("assembler.tassArgs:", config.get("assembler.tassArgs"));
    console.log("assembler.cl65Path:", config.get("assembler.cl65Path"));
    console.log("assembler.cl65Args:", config.get("assembler.cl65Args"));
    console.log("emulator.theme:", config.get("emulator.theme"));
    console.log("emulator.appmode:", config.get("emulator.appmode"));
    
    // Test that we can inspect the configuration object
    console.log("Full configuration object:", config);
}