import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export class AssemblerService {
  private outputChannel: vscode.OutputChannel

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel
  }

  public async assembleFile(sourceUri: vscode.Uri): Promise<[number, Uint8Array]> {
    const sourcePath = sourceUri.fsPath
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(sourceUri)
    
    // Use workspace folder if available, otherwise use the file's directory
    const workspacePath = workspaceFolder ? workspaceFolder.uri.fsPath : path.dirname(sourcePath)
    const sourceFileName = path.basename(sourcePath, path.extname(sourcePath))
    const objectPath = path.join(workspacePath, `${sourceFileName}.o`)
    const binaryPath = path.join(workspacePath, `${sourceFileName}.bin`)

    this.outputChannel.clear()
    this.outputChannel.show()

    try {
      // Get assembler path and arguments from configuration
      const config = vscode.workspace.getConfiguration('apple2ts')
      const assemblerPath = config.get<string>('assembler.path', '64tass')
      const assemblerArgs = config.get<string>('assembler.args', '-a --apple-ii --m65c02')

      this.outputChannel.appendLine(`Assembling: ${sourcePath}`)

      // Check if we can use 64tass or fall back to simple assembler
      if (await this.checkToolExists(assemblerPath)) {
        return await this.assembleWith64tass(sourcePath, binaryPath, assemblerPath, assemblerArgs)
      } else {
        this.outputChannel.appendLine('64tass not found, using built-in simple assembler')
        return await this.assembleWithSimpleAssembler(sourcePath)
      }
    } catch (error) {
      this.outputChannel.appendLine(`Error: ${error}`)
      throw error
    }
  }

  private async assembleWith64tass(sourcePath: string, binaryPath: string, assemblerPath: string, assemblerArgs: string): Promise<[number, Uint8Array]> {
    // Assemble with 64tass
    const assembleCommand = `"${assemblerPath}" ${assemblerArgs} -o "${binaryPath}" "${sourcePath}"`
    this.outputChannel.appendLine(`Running: ${assembleCommand}`)
    
    const assembleResult = await execAsync(assembleCommand)
    if (assembleResult.stderr) {
      this.outputChannel.appendLine(`Assembler stderr: ${assembleResult.stderr}`)
    }
    if (assembleResult.stdout) {
      this.outputChannel.appendLine(`Assembler stdout: ${assembleResult.stdout}`)
    }

    // Read the binary file
    let binary = await fs.promises.readFile(binaryPath)
    // Since we used --apple-ii, the first four bytes have the load address and
    // the data length (always equal to 1). Retrieve the address and strip the header.
    const address = binary[0] + (binary[1] << 8)
    binary = binary.slice(4)
    
    this.outputChannel.appendLine(`Successfully generated ${binary.length} bytes`)
    
    return [address, new Uint8Array(binary)]
  }

  private async assembleWithSimpleAssembler(sourcePath: string): Promise<[number, Uint8Array]> {
    // Read the source file
    const source = await fs.promises.readFile(sourcePath, 'utf8')
    
    // Simple 6502 assembler - basic implementation
    const lines = source.split('\n')
    const binary: number[] = []
    let address = 0x0800 // Start at $0800

    this.outputChannel.appendLine('Using simple built-in assembler')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === '' || line.startsWith(';')) {
        continue // Skip empty lines and comments
      }

      // Very basic instruction parsing
      if (line.toUpperCase().startsWith('LDA #')) {
        const value = this.parseValue(line.substring(5))
        binary.push(0xA9, value) // LDA immediate
        this.outputChannel.appendLine(`${address.toString(16).toUpperCase().padStart(4, '0')}: A9 ${value.toString(16).toUpperCase().padStart(2, '0')} LDA #$${value.toString(16).toUpperCase()}`)
        address += 2
      } else if (line.toUpperCase().startsWith('STA ')) {
        const addr = this.parseAddress(line.substring(4))
        binary.push(0x8D, addr & 0xFF, (addr >> 8) & 0xFF) // STA absolute
        this.outputChannel.appendLine(`${address.toString(16).toUpperCase().padStart(4, '0')}: 8D ${(addr & 0xFF).toString(16).toUpperCase().padStart(2, '0')} ${((addr >> 8) & 0xFF).toString(16).toUpperCase().padStart(2, '0')} STA $${addr.toString(16).toUpperCase()}`)
        address += 3
      } else if (line.toUpperCase() === 'RTS') {
        binary.push(0x60) // RTS
        this.outputChannel.appendLine(`${address.toString(16).toUpperCase().padStart(4, '0')}: 60 RTS`)
        address += 1
      } else if (line.toUpperCase() === 'NOP') {
        binary.push(0xEA) // NOP
        this.outputChannel.appendLine(`${address.toString(16).toUpperCase().padStart(4, '0')}: EA NOP`)
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
    if (trimmed.startsWith('$')) {
      return parseInt(trimmed.substring(1), 16)
    } else if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
      return parseInt(trimmed.substring(2), 16)
    } else {
      return parseInt(trimmed, 10)
    }
  }

  private parseAddress(addrStr: string): number {
    return this.parseValue(addrStr)
  }

  private async checkToolExists(toolPath: string): Promise<boolean> {
    try {
      // 64tass uses --help instead of --version
      await execAsync(`"${toolPath}" --help`)
      return true
    } catch {
      return false
    }
  }
}