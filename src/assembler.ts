import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export class AssemblerService {
  private outputChannel: vscode.OutputChannel

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel
  }

  public async assembleFile(sourceUri: vscode.Uri): Promise<[number, Uint8Array]> {
    const sourcePath = sourceUri.fsPath
    
    // Use the file's directory for output files
    const workspacePath = path.dirname(sourcePath)
    const sourceFileName = path.basename(sourcePath, path.extname(sourcePath))
    const binaryPath = path.join(workspacePath, `${sourceFileName}.bin`)

    this.outputChannel.clear()
    this.outputChannel.show()

    try {
      // Get assembler preference from configuration
      const config = vscode.workspace.getConfiguration("apple2ts")
      const selectedAssembler = config.get<string>("assembler6502", "64tass")
      
      this.outputChannel.appendLine(`Assembling: ${sourcePath}`)
      this.outputChannel.appendLine(`Selected assembler: ${selectedAssembler}`)

      // Try to use the selected assembler, fall back to simple assembler if not available
      if (selectedAssembler === "64tass") {
        return await this.assembleWith64tass(sourcePath, binaryPath)
      } else if (selectedAssembler === "cl65") {
        return await this.assembleWithCl65(sourcePath, workspacePath, sourceFileName)
      } else if (selectedAssembler === "merlin32") {
        return await this.assembleWithMerlin32(sourcePath, workspacePath, sourceFileName)
      } else {
        this.outputChannel.appendLine(`Unknown assembler "${selectedAssembler}", using simple assembler`)
        return await this.assembleWithSimpleAssembler(sourcePath)
      }
    } catch (error) {
      this.outputChannel.appendLine(`Error: ${error}`)
      throw error
    }
  }

  private async assembleWith64tass(sourcePath: string, binaryPath: string): Promise<[number, Uint8Array]> {
    const config = vscode.workspace.getConfiguration("apple2ts")
    const assemblerPath = config.get<string>("assembler.tassPath", "64tass")
    const assemblerArgs = config.get<string>("assembler.tassArgs", "-a --nostart --m65c02")
    if (!this.checkToolExists(assemblerPath)) {
      throw new Error(`64tass assembler not found at path: ${assemblerPath}`)
    }
    
    // Get load address from source file
    const address = await this.parseLoadAddress(sourcePath)
    
    // Get binary name from source file, fallback to original name
    const workspacePath = path.dirname(sourcePath)
    const sourceFileName = path.basename(sourcePath, path.extname(sourcePath))
    const binaryName = await this.parseBinaryName(sourcePath, sourceFileName)
    const actualBinaryPath = path.join(workspacePath, `${binaryName}.bin`)
    
    // Assemble with 64tass
    const assembleCommand = `"${assemblerPath}" ${assemblerArgs} -o "${actualBinaryPath}" "${sourcePath}"`
    this.outputChannel.appendLine(`Running: ${assembleCommand}`)
    
    const assembleResult = await execAsync(assembleCommand)
    if (assembleResult.stderr) {
      this.outputChannel.appendLine(`Assembler stderr: ${assembleResult.stderr}`)
    }
    if (assembleResult.stdout) {
      this.outputChannel.appendLine(`Assembler stdout: ${assembleResult.stdout}`)
    }

    // Read the binary file
    let binary = await fs.promises.readFile(actualBinaryPath)
    // Skip the 4-byte header if present (from --apple-ii format)
    if (binary.length >= 4 && assemblerArgs.includes("--apple-ii")) {
      binary = binary.slice(4)
    }
    
    this.outputChannel.appendLine(`Successfully generated ${binary.length} bytes at address $${address.toString(16).toUpperCase()}`)
    
    return [address, new Uint8Array(binary)]
  }

  private async assembleWithCl65(sourcePath: string, workspacePath: string, sourceFileName: string): Promise<[number, Uint8Array]> {
    const config = vscode.workspace.getConfiguration("apple2ts")
    const assemblerPath = config.get<string>("assembler.cl65Path", "cl65")
    const assemblerArgs = config.get<string>("assembler.cl65Args", "-t none")
    if (!this.checkToolExists(assemblerPath)) {
      throw new Error(`cl65 assembler not found at path: ${assemblerPath}`)
    }

    // Get load address from source file
    const address = await this.parseLoadAddress(sourcePath)
    
    // Get binary name from source file, fallback to original name
    const binaryName = await this.parseBinaryName(sourcePath, sourceFileName)
    const binaryPath = path.join(workspacePath, `${binaryName}.bin`)
    
    try {
      const assembleCommand = `"${assemblerPath}" ${assemblerArgs} -o "${binaryPath}" "${sourcePath}"`
      this.outputChannel.appendLine(`Running: ${assembleCommand}`)
      
      const assembleResult = await execAsync(assembleCommand)
      if (assembleResult.stderr) {
        this.outputChannel.appendLine(`cl65 stderr: ${assembleResult.stderr}`)
      }
      if (assembleResult.stdout) {
        this.outputChannel.appendLine(`cl65 stdout: ${assembleResult.stdout}`)
      }

      // Read the binary file
      const binary = await fs.promises.readFile(binaryPath)
      
      this.outputChannel.appendLine(`Successfully generated ${binary.length} bytes at address $${address.toString(16).toUpperCase()}`)
      
      return [address, new Uint8Array(binary)]
    } catch (error) {
      throw error
    }
  }

  private async assembleWithMerlin32(sourcePath: string, workspacePath: string, sourceFileName: string): Promise<[number, Uint8Array]> {
    const config = vscode.workspace.getConfiguration("apple2ts")
    const assemblerPath = config.get<string>("assembler.merlinPath", "merlin32")
    const assemblerArgs = config.get<string>("assembler.merlinArgs", "")
    const assemblerMacros = config.get<string>("assembler.merlinMacros", "")
    if (!this.checkToolExists(assemblerPath)) {
      throw new Error(`merlin32 assembler not found at path: ${assemblerPath}`)
    }

    // Get load address from source file
    const address = await this.parseLoadAddress(sourcePath)
    
    // Get binary name from source file, fallback to original name
    const binaryName = await this.parseBinaryName(sourcePath, sourceFileName)
    const binaryPath = path.join(workspacePath, `${binaryName}`)
    
    // Get extension path and add library directory
    const extensionPath = path.dirname(__dirname) // Go up from 'out' to extension root
    const libraryPath = (assemblerMacros !== "") ? assemblerMacros :
      path.join(extensionPath, "src", "merlin32_library")
    
    try {
      const assembleCommand = `"${assemblerPath}" -V "${libraryPath}" ${assemblerArgs} "${sourcePath}"`
      this.outputChannel.appendLine(`Running: ${assembleCommand}`)
      
      const assembleResult = await execAsync(assembleCommand)
      if (assembleResult.stderr) {
        this.outputChannel.appendLine(`merlin32 stderr: ${assembleResult.stderr}`)
      }
      if (assembleResult.stdout) {
        this.outputChannel.appendLine(`merlin32 stdout: ${assembleResult.stdout}`)
      }

      // Read the binary file
      const binary = await fs.promises.readFile(binaryPath)
      
      this.outputChannel.appendLine(`Successfully generated ${binary.length} bytes at address $${address.toString(16).toUpperCase()}`)
      
      return [address, new Uint8Array(binary)]
    } catch (error) {
      throw error
    }
  }

  private async assembleWithSimpleAssembler(sourcePath: string): Promise<[number, Uint8Array]> {
    // Read the source file
    const source = await fs.promises.readFile(sourcePath, "utf8")
    
    // Simple 6502 assembler - basic implementation
    const lines = source.split("\n")
    const binary: number[] = []
    let address = 0x0800 // Start at $0800

    this.outputChannel.appendLine("Using simple built-in assembler")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === "" || line.startsWith(";")) {
        continue // Skip empty lines and comments
      }

      // Very basic instruction parsing
      if (line.toUpperCase().startsWith("LDA #")) {
        const value = this.parseValue(line.substring(5))
        binary.push(0xA9, value) // LDA immediate
        this.outputChannel.appendLine(`${address.toString(16).toUpperCase().padStart(4, "0")}: A9 ${value.toString(16).toUpperCase().padStart(2, "0")} LDA #$${value.toString(16).toUpperCase()}`)
        address += 2
      } else if (line.toUpperCase().startsWith("STA ")) {
        const addr = this.parseAddress(line.substring(4))
        binary.push(0x8D, addr & 0xFF, (addr >> 8) & 0xFF) // STA absolute
        this.outputChannel.appendLine(`${address.toString(16).toUpperCase().padStart(4, "0")}: 8D ${(addr & 0xFF).toString(16).toUpperCase().padStart(2, "0")} ${((addr >> 8) & 0xFF).toString(16).toUpperCase().padStart(2, "0")} STA $${addr.toString(16).toUpperCase()}`)
        address += 3
      } else if (line.toUpperCase() === "RTS") {
        binary.push(0x60) // RTS
        this.outputChannel.appendLine(`${address.toString(16).toUpperCase().padStart(4, "0")}: 60 RTS`)
        address += 1
      } else if (line.toUpperCase() === "NOP") {
        binary.push(0xEA) // NOP
        this.outputChannel.appendLine(`${address.toString(16).toUpperCase().padStart(4, "0")}: EA NOP`)
        address += 1
      } else {
        this.outputChannel.appendLine(`Warning: Unrecognized instruction at line ${i + 1}: ${line}`)
      }
    }

    this.outputChannel.appendLine(`Simple assembler generated ${binary.length} bytes`)
    return [address, new Uint8Array(binary)]
  }

  private parseValue(valueStr: string): number {
    const trimmed = valueStr.trim()
    if (trimmed.startsWith("$")) {
      return parseInt(trimmed.substring(1), 16)
    } else if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
      return parseInt(trimmed.substring(2), 16)
    } else {
      return parseInt(trimmed, 10)
    }
  }

  private parseAddress(addrStr: string): number {
    return this.parseValue(addrStr)
  }

  private async parseBinaryName(sourcePath: string, defaultName: string): Promise<string> {
    try {
      const source = await fs.promises.readFile(sourcePath, "utf8")
      const lines = source.split("\n")
      
      for (const line of lines) {
        const trimmed = line.trim()
        // Look for DSK directive: DSK filename ; comment
        const matchDSK = trimmed.match(/^\s*DSK\s+([^\s;]+)/i)
        if (matchDSK) {
          const binaryName = matchDSK[1]
          this.outputChannel.appendLine(`Found binary name: ${binaryName}`)
          return binaryName
        }
      }
      
      // Default to source filename if no DSK directive found
      this.outputChannel.appendLine(`No DSK directive found, using default: ${defaultName}`)
      return defaultName
    } catch (error) {
      this.outputChannel.appendLine(`Error parsing binary name: ${error}`)
      return defaultName
    }
  }

  private async parseLoadAddress(sourcePath: string): Promise<number> {
    try {
      const source = await fs.promises.readFile(sourcePath, "utf8")
      const lines = source.split("\n")
      
      for (const line of lines) {
        const trimmed = line.trim()
        // Look for 64tass syntax: * = $address or *= $address
        const match64tass = trimmed.match(/^\s*\*\s*=\s*\$([0-9a-fA-F]+)/i)
        if (match64tass) {
          const addr = parseInt(match64tass[1], 16)
          this.outputChannel.appendLine(`Found load address: $${addr.toString(16).toUpperCase()}`)
          return addr
        }
        
        // Look for ca65/merlin32 syntax: .org $address or org $address
        const matchOrg = trimmed.match(/^\s*\.?org\s+\$([0-9a-fA-F]+)/i)
        if (matchOrg) {
          const addr = parseInt(matchOrg[1], 16)
          this.outputChannel.appendLine(`Found load address: $${addr.toString(16).toUpperCase()}`)
          return addr
        }
      }
      
      // Default to $0800 if no address found
      this.outputChannel.appendLine("No load address found, defaulting to $0800")
      return 0x0800
    } catch (error) {
      this.outputChannel.appendLine(`Error parsing load address: ${error}`)
      return 0x0800
    }
  }

  private async checkToolExists(toolPath: string): Promise<boolean> {
    try {
      if (toolPath.includes("64tass")) {
        // 64tass uses --help instead of --version
        await execAsync(`"${toolPath}" --help`)
      } else if (toolPath.includes("cl65")) {
        // cl65 uses --version
        await execAsync(`"${toolPath}" --version`)
      } else {
        // Generic check with --help
        await execAsync(`"${toolPath}" --help`)
      }
      return true
    } catch {
      return false
    }
  }
}