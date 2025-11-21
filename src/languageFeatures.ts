import * as vscode from 'vscode'

interface Instruction {
  mnemonic: string
  description: string
  addressing: string[]
  cycles: number
}

export class LanguageFeatures {
  private instructions: Instruction[] = [
    { mnemonic: 'ADC', description: 'Add with Carry', addressing: ['#nn', 'nn', 'nnnn', 'nn,X', 'nnnn,X', 'nnnn,Y', '(nn,X)', '(nn),Y'], cycles: 2 },
    { mnemonic: 'AND', description: 'Logical AND', addressing: ['#nn', 'nn', 'nnnn', 'nn,X', 'nnnn,X', 'nnnn,Y', '(nn,X)', '(nn),Y'], cycles: 2 },
    { mnemonic: 'ASL', description: 'Arithmetic Shift Left', addressing: ['A', 'nn', 'nnnn', 'nn,X', 'nnnn,X'], cycles: 2 },
    { mnemonic: 'BCC', description: 'Branch if Carry Clear', addressing: ['nn'], cycles: 2 },
    { mnemonic: 'BCS', description: 'Branch if Carry Set', addressing: ['nn'], cycles: 2 },
    { mnemonic: 'BEQ', description: 'Branch if Equal', addressing: ['nn'], cycles: 2 },
    { mnemonic: 'BIT', description: 'Bit Test', addressing: ['nn', 'nnnn'], cycles: 3 },
    { mnemonic: 'BMI', description: 'Branch if Minus', addressing: ['nn'], cycles: 2 },
    { mnemonic: 'BNE', description: 'Branch if Not Equal', addressing: ['nn'], cycles: 2 },
    { mnemonic: 'BPL', description: 'Branch if Positive', addressing: ['nn'], cycles: 2 },
    { mnemonic: 'BRK', description: 'Break', addressing: [''], cycles: 7 },
    { mnemonic: 'BVC', description: 'Branch if Overflow Clear', addressing: ['nn'], cycles: 2 },
    { mnemonic: 'BVS', description: 'Branch if Overflow Set', addressing: ['nn'], cycles: 2 },
    { mnemonic: 'CLC', description: 'Clear Carry Flag', addressing: [''], cycles: 2 },
    { mnemonic: 'CLD', description: 'Clear Decimal Flag', addressing: [''], cycles: 2 },
    { mnemonic: 'CLI', description: 'Clear Interrupt Flag', addressing: [''], cycles: 2 },
    { mnemonic: 'CLV', description: 'Clear Overflow Flag', addressing: [''], cycles: 2 },
    { mnemonic: 'CMP', description: 'Compare Accumulator', addressing: ['#nn', 'nn', 'nnnn', 'nn,X', 'nnnn,X', 'nnnn,Y', '(nn,X)', '(nn),Y'], cycles: 2 },
    { mnemonic: 'CPX', description: 'Compare X Register', addressing: ['#nn', 'nn', 'nnnn'], cycles: 2 },
    { mnemonic: 'CPY', description: 'Compare Y Register', addressing: ['#nn', 'nn', 'nnnn'], cycles: 2 },
    { mnemonic: 'DEC', description: 'Decrement Memory', addressing: ['nn', 'nnnn', 'nn,X', 'nnnn,X'], cycles: 5 },
    { mnemonic: 'DEX', description: 'Decrement X Register', addressing: [''], cycles: 2 },
    { mnemonic: 'DEY', description: 'Decrement Y Register', addressing: [''], cycles: 2 },
    { mnemonic: 'EOR', description: 'Exclusive OR', addressing: ['#nn', 'nn', 'nnnn', 'nn,X', 'nnnn,X', 'nnnn,Y', '(nn,X)', '(nn),Y'], cycles: 2 },
    { mnemonic: 'INC', description: 'Increment Memory', addressing: ['nn', 'nnnn', 'nn,X', 'nnnn,X'], cycles: 5 },
    { mnemonic: 'INX', description: 'Increment X Register', addressing: [''], cycles: 2 },
    { mnemonic: 'INY', description: 'Increment Y Register', addressing: [''], cycles: 2 },
    { mnemonic: 'JMP', description: 'Jump', addressing: ['nnnn', '(nnnn)'], cycles: 3 },
    { mnemonic: 'JSR', description: 'Jump to Subroutine', addressing: ['nnnn'], cycles: 6 },
    { mnemonic: 'LDA', description: 'Load Accumulator', addressing: ['#nn', 'nn', 'nnnn', 'nn,X', 'nnnn,X', 'nnnn,Y', '(nn,X)', '(nn),Y'], cycles: 2 },
    { mnemonic: 'LDX', description: 'Load X Register', addressing: ['#nn', 'nn', 'nnnn', 'nn,Y', 'nnnn,Y'], cycles: 2 },
    { mnemonic: 'LDY', description: 'Load Y Register', addressing: ['#nn', 'nn', 'nnnn', 'nn,X', 'nnnn,X'], cycles: 2 },
    { mnemonic: 'LSR', description: 'Logical Shift Right', addressing: ['A', 'nn', 'nnnn', 'nn,X', 'nnnn,X'], cycles: 2 },
    { mnemonic: 'NOP', description: 'No Operation', addressing: [''], cycles: 2 },
    { mnemonic: 'ORA', description: 'Logical OR', addressing: ['#nn', 'nn', 'nnnn', 'nn,X', 'nnnn,X', 'nnnn,Y', '(nn,X)', '(nn),Y'], cycles: 2 },
    { mnemonic: 'PHA', description: 'Push Accumulator', addressing: [''], cycles: 3 },
    { mnemonic: 'PHP', description: 'Push Processor Status', addressing: [''], cycles: 3 },
    { mnemonic: 'PLA', description: 'Pull Accumulator', addressing: [''], cycles: 4 },
    { mnemonic: 'PLP', description: 'Pull Processor Status', addressing: [''], cycles: 4 },
    { mnemonic: 'ROL', description: 'Rotate Left', addressing: ['A', 'nn', 'nnnn', 'nn,X', 'nnnn,X'], cycles: 2 },
    { mnemonic: 'ROR', description: 'Rotate Right', addressing: ['A', 'nn', 'nnnn', 'nn,X', 'nnnn,X'], cycles: 2 },
    { mnemonic: 'RTI', description: 'Return from Interrupt', addressing: [''], cycles: 6 },
    { mnemonic: 'RTS', description: 'Return from Subroutine', addressing: [''], cycles: 6 },
    { mnemonic: 'SBC', description: 'Subtract with Carry', addressing: ['#nn', 'nn', 'nnnn', 'nn,X', 'nnnn,X', 'nnnn,Y', '(nn,X)', '(nn),Y'], cycles: 2 },
    { mnemonic: 'SEC', description: 'Set Carry Flag', addressing: [''], cycles: 2 },
    { mnemonic: 'SED', description: 'Set Decimal Flag', addressing: [''], cycles: 2 },
    { mnemonic: 'SEI', description: 'Set Interrupt Flag', addressing: [''], cycles: 2 },
    { mnemonic: 'STA', description: 'Store Accumulator', addressing: ['nn', 'nnnn', 'nn,X', 'nnnn,X', 'nnnn,Y', '(nn,X)', '(nn),Y'], cycles: 3 },
    { mnemonic: 'STX', description: 'Store X Register', addressing: ['nn', 'nnnn', 'nn,Y'], cycles: 3 },
    { mnemonic: 'STY', description: 'Store Y Register', addressing: ['nn', 'nnnn', 'nn,X'], cycles: 3 },
    { mnemonic: 'TAX', description: 'Transfer A to X', addressing: [''], cycles: 2 },
    { mnemonic: 'TAY', description: 'Transfer A to Y', addressing: [''], cycles: 2 },
    { mnemonic: 'TSX', description: 'Transfer Stack Pointer to X', addressing: [''], cycles: 2 },
    { mnemonic: 'TXA', description: 'Transfer X to A', addressing: [''], cycles: 2 },
    { mnemonic: 'TXS', description: 'Transfer X to Stack Pointer', addressing: [''], cycles: 2 },
    { mnemonic: 'TYA', description: 'Transfer Y to A', addressing: [''], cycles: 2 }
  ]

  private appleIIAddresses: { [key: string]: string } = {
    '$C000': 'Keyboard input',
    '$C010': 'Clear keyboard strobe',
    '$C020': 'Cassette output toggle',
    '$C030': 'Speaker toggle',
    '$C040': 'Utility strobe',
    '$C050': 'Graphics mode off',
    '$C051': 'Graphics mode on',
    '$C052': 'Mixed mode off',
    '$C053': 'Mixed mode on',
    '$C054': 'Page 1 display',
    '$C055': 'Page 2 display',
    '$C056': 'Lo-res graphics',
    '$C057': 'Hi-res graphics',
    '$C061': 'Push button 0/Apple paddle 0',
    '$C062': 'Push button 1/Apple paddle 1',
    '$C070': 'Game paddle trigger',
    '$E000': 'Integer BASIC ROM',
    '$F000': 'Monitor ROM',
    '$FFFA': 'NMI vector',
    '$FFFC': 'Reset vector',
    '$FFFE': 'IRQ vector'
  }

  public register(context: vscode.ExtensionContext) {
    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
      'asm6502',
      {
        provideCompletionItems: (document: vscode.TextDocument, position: vscode.Position) => {
          return this.provideCompletionItems(document, position)
        }
      },
      ' ', '#', '$', ','
    )

    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider(
      'asm6502',
      {
        provideHover: (document: vscode.TextDocument, position: vscode.Position) => {
          return this.provideHover(document, position)
        }
      }
    )

    // Register signature help provider
    const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider(
      'asm6502',
      {
        provideSignatureHelp: (document: vscode.TextDocument, position: vscode.Position) => {
          return this.provideSignatureHelp(document, position)
        }
      },
      ' ', ','
    )

    context.subscriptions.push(completionProvider, hoverProvider, signatureHelpProvider)
  }

  private provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
    const linePrefix = document.lineAt(position).text.substring(0, position.character)
    const items: vscode.CompletionItem[] = []

    // Instruction completions
    for (const instruction of this.instructions) {
      const item = new vscode.CompletionItem(instruction.mnemonic, vscode.CompletionItemKind.Keyword)
      item.detail = instruction.description
      item.documentation = new vscode.MarkdownString(
        `**${instruction.mnemonic}** - ${instruction.description}\n\n` +
        `Addressing modes: ${instruction.addressing.join(', ')}\n\n` +
        `Cycles: ${instruction.cycles}`
      )
      item.insertText = instruction.mnemonic
      items.push(item)
    }

    // Apple II specific addresses
    if (linePrefix.includes('$')) {
      for (const [address, description] of Object.entries(this.appleIIAddresses)) {
        const item = new vscode.CompletionItem(address, vscode.CompletionItemKind.Constant)
        item.detail = description
        item.documentation = new vscode.MarkdownString(`Apple II system address: **${address}**\n\n${description}`)
        items.push(item)
      }
    }

    // Common assembler directives
    const directives = ['.org', '.byte', '.word', '.text', '.include']
    for (const directive of directives) {
      const item = new vscode.CompletionItem(directive, vscode.CompletionItemKind.Snippet)
      item.detail = 'Assembler directive'
      items.push(item)
    }

    return items
  }

  private provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
    const range = document.getWordRangeAtPosition(position)
    if (!range) {
      return undefined
    }

    const word = document.getText(range).toUpperCase()

    // Check if it's an instruction
    const instruction = this.instructions.find(inst => inst.mnemonic === word)
    if (instruction) {
      const markdown = new vscode.MarkdownString()
      markdown.appendMarkdown(`**${instruction.mnemonic}** - ${instruction.description}\n\n`)
      markdown.appendMarkdown(`Addressing modes: \`${instruction.addressing.join(', ')}\`\n\n`)
      markdown.appendMarkdown(`Cycles: ${instruction.cycles}`)
      return new vscode.Hover(markdown, range)
    }

    // Check if it's an Apple II address
    const lineText = document.lineAt(position.line).text
    const addressMatch = lineText.match(/\$[0-9A-Fa-f]{4}/)
    if (addressMatch) {
      const address = addressMatch[0].toUpperCase()
      const description = this.appleIIAddresses[address]
      if (description) {
        const markdown = new vscode.MarkdownString()
        markdown.appendMarkdown(`**${address}** - ${description}`)
        return new vscode.Hover(markdown, range)
      }
    }

    return undefined
  }

  private provideSignatureHelp(document: vscode.TextDocument, position: vscode.Position): vscode.SignatureHelp | undefined {
    const line = document.lineAt(position.line).text
    const beforeCursor = line.substring(0, position.character)
    
    // Find the instruction at the beginning of the line
    const instructionMatch = beforeCursor.match(/^\s*([A-Za-z]{3})/)
    if (!instructionMatch) {
      return undefined
    }

    const instructionName = instructionMatch[1].toUpperCase()
    const instruction = this.instructions.find(inst => inst.mnemonic === instructionName)
    
    if (!instruction) {
      return undefined
    }

    const signatureHelp = new vscode.SignatureHelp()
    const signature = new vscode.SignatureInformation(`${instruction.mnemonic} - ${instruction.description}`)
    signature.documentation = new vscode.MarkdownString(
      `Addressing modes: ${instruction.addressing.join(', ')}\n\nCycles: ${instruction.cycles}`
    )
    
    signatureHelp.signatures = [signature]
    signatureHelp.activeSignature = 0
    signatureHelp.activeParameter = 0

    return signatureHelp
  }
}