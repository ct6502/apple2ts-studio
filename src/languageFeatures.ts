import * as vscode from "vscode"

interface Instruction {
  mnemonic: string
  description: string
  addressing: string[]
  cycles: string
}

const makeInstr = (mnemonic: string, description: string, addressing: string[], cycles: string): Instruction => {
  return { mnemonic, description, addressing, cycles }
}

export class LanguageFeatures {
  emptyMode = ["--"]
  allModes = ["#nn", "nn", "nnnn", "nn,X", "nnnn,X", "nnnn,Y", "(nn,X)", "(nn),Y", "(nn)"]
  private instructions: Instruction[] = [
    makeInstr("adc", "Add with Carry", this.allModes, "2-6"),
    makeInstr("and", "Logical AND", this.allModes, "2-6"),
    makeInstr("asl", "Arithmetic Shift Left", ["A", "nn", "nnnn", "nn,X", "nnnn,X"], "2-7"),
    makeInstr("bcc", "Branch if Carry Clear", ["nn"], "2*"),
    makeInstr("bcs", "Branch if Carry Set", ["nn"], "2*"),
    makeInstr("beq", "Branch if Equal", ["nn"], "2*"),
    makeInstr("bit", "Bit Test", ["nn", "nnnn"], "2-4+"),
    makeInstr("bmi", "Branch if Minus", ["nn"], "2*"),
    makeInstr("bne", "Branch if Not Equal", ["nn"], "2*"),
    makeInstr("bpl", "Branch if Positive", ["nn"], "2*"),
    makeInstr("bra", "Branch Always", ["nn"], "3+"),
    makeInstr("brk", "Break", this.emptyMode, "7"),
    makeInstr("bvc", "Branch if Overflow Clear", ["nn"], "2*"),
    makeInstr("bvs", "Branch if Overflow Set", ["nn"], "2*"),
    makeInstr("clc", "Clear Carry Flag", this.emptyMode, "2"),
    makeInstr("cld", "Clear Decimal Flag", this.emptyMode, "2"),
    makeInstr("cli", "Clear Interrupt Flag", this.emptyMode, "2"),
    makeInstr("clv", "Clear Overflow Flag", this.emptyMode, "2"),
    makeInstr("cmp", "Compare Accumulator", this.allModes, "2-6"),
    makeInstr("cpx", "Compare X Register", ["#nn", "nn", "nnnn"], "2-4"),
    makeInstr("cpy", "Compare Y Register", ["#nn", "nn", "nnnn"], "2-4"),
    makeInstr("dec", "Decrement Accum/Memory", ["--", "nn", "nnnn", "nn,X", "nnnn,X"], "2-7"),
    makeInstr("dex", "Decrement X Register", this.emptyMode, "2"),
    makeInstr("dey", "Decrement Y Register", this.emptyMode, "2"),
    makeInstr("eor", "Exclusive OR", this.allModes, "2-6"),
    makeInstr("inc", "Increment Accum/Memory", ["--", "nn", "nnnn", "nn,X", "nnnn,X"], "5-7"),
    makeInstr("inx", "Increment X Register", this.emptyMode, "2"),
    makeInstr("iny", "Increment Y Register", this.emptyMode, "2"),
    makeInstr("jmp", "Jump", ["nnnn", "(nnnn)"], "3-6"),
    makeInstr("jsr", "Jump to Subroutine", ["nnnn"], "6"),
    makeInstr("lda", "Load Accumulator", this.allModes, "2-6"),
    makeInstr("ldx", "Load X Register", ["#nn", "nn", "nnnn", "nn,Y", "nnnn,Y"], "2-4+"),
    makeInstr("ldy", "Load Y Register", ["#nn", "nn", "nnnn", "nn,X", "nnnn,X"], "2-4+"),
    makeInstr("lsr", "Logical Shift Right", ["A", "nn", "nnnn", "nn,X", "nnnn,X"], "2-7"),
    makeInstr("nop", "No Operation", this.emptyMode, "2"),
    makeInstr("ora", "Logical OR", this.allModes, "2-6"),
    makeInstr("pha", "Push Accumulator", this.emptyMode, "3"),
    makeInstr("php", "Push Processor Status", this.emptyMode, "3"),
    makeInstr("phx", "Push X Register", this.emptyMode, "3"),
    makeInstr("phy", "Push Y Register", this.emptyMode, "3"),
    makeInstr("pla", "Pull Accumulator", this.emptyMode, "4"),
    makeInstr("plp", "Pull Processor Status", this.emptyMode, "4"),
    makeInstr("plx", "Pull X Register", this.emptyMode, "4"),
    makeInstr("ply", "Pull Y Register", this.emptyMode, "4"),
    makeInstr("rol", "Rotate Left", ["A", "nn", "nnnn", "nn,X", "nnnn,X"], "2-7"),
    makeInstr("ror", "Rotate Right", ["A", "nn", "nnnn", "nn,X", "nnnn,X"], "2-7"),
    makeInstr("rti", "Return from Interrupt", this.emptyMode, "6"),
    makeInstr("rts", "Return from Subroutine", this.emptyMode, "6"),
    makeInstr("sbc", "Subtract with Carry", this.allModes, "2-6"),
    makeInstr("sec", "Set Carry Flag", this.emptyMode, "2"),
    makeInstr("sed", "Set Decimal Flag", this.emptyMode, "2"),
    makeInstr("sei", "Set Interrupt Flag", this.emptyMode, "2"),
    makeInstr("sta", "Store Accumulator", ["nn", "nnnn", "nn,X", "nnnn,X", "nnnn,Y", "(nn,X)", "(nn),Y", "(nn)"], "3-6"),
    makeInstr("stx", "Store X Register", ["nn", "nnnn", "nn,Y"], "3-4"),
    makeInstr("sty", "Store Y Register", ["nn", "nnnn", "nn,X"], "3-4"),
    makeInstr("stz", "Store Zero in Memory", ["nn", "nn,X", "nnnn", "nnnn,X"], "3-5"),
    makeInstr("tax", "Transfer A to X", this.emptyMode, "2"),
    makeInstr("tay", "Transfer A to Y", this.emptyMode, "2"),
    makeInstr("trb", "Test and Reset Bits", ["nn", "nnnn"], "5-6"),
    makeInstr("tsb", "Test and Set Bits", ["nn", "nnnn"], "5-6"),
    makeInstr("tsx", "Transfer Stack Pointer to X", this.emptyMode, "2"),
    makeInstr("txa", "Transfer X to A", this.emptyMode, "2"),
    makeInstr("txs", "Transfer X to Stack Pointer", this.emptyMode, "2"),
    makeInstr("tya", "Transfer Y to A", this.emptyMode, "2")
  ]

  private appleIIAddresses: { [key: string]: string } = {
    "$C000": "Keyboard input",
    "$C010": "Clear keyboard strobe",
    "$C020": "Cassette output toggle",
    "$C030": "Speaker toggle",
    "$C040": "Utility strobe",
    "$C050": "Graphics mode off",
    "$C051": "Graphics mode on",
    "$C052": "Mixed mode off",
    "$C053": "Mixed mode on",
    "$C054": "Page 1 display",
    "$C055": "Page 2 display",
    "$C056": "Lo-res graphics",
    "$C057": "Hi-res graphics",
    "$C061": "Push button 0/Apple paddle 0",
    "$C062": "Push button 1/Apple paddle 1",
    "$C070": "Game paddle trigger",
    "$E000": "Integer BASIC ROM",
    "$F000": "Monitor ROM",
    "$FFFA": "NMI vector",
    "$FFFC": "Reset vector",
    "$FFFE": "IRQ vector"
  }

  public register(context: vscode.ExtensionContext) {
    // Register completion provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
      "apple2ts6502Assembly",
      {
        provideCompletionItems: (document: vscode.TextDocument, position: vscode.Position) => {
          return this.provideCompletionItems(document, position)
        }
      },
      " ", "#", "$", ","
    )

    // Register hover provider
    const hoverProvider = vscode.languages.registerHoverProvider(
      "apple2ts6502Assembly",
      {
        provideHover: (document: vscode.TextDocument, position: vscode.Position) => {
          return this.provideHover(document, position)
        }
      }
    )

    // Register signature help provider
    const signatureHelpProvider = vscode.languages.registerSignatureHelpProvider(
      "apple2ts6502Assembly",
      {
        provideSignatureHelp: (document: vscode.TextDocument, position: vscode.Position) => {
          return this.provideSignatureHelp(document, position)
        }
      },
      " ", ","
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
        `Addressing modes: ${instruction.addressing.join(", ")}\n\n` +
        `Cycles: ${instruction.cycles}`
      )
      item.insertText = instruction.mnemonic
      items.push(item)
    }

    // Apple II specific addresses
    if (linePrefix.includes("$")) {
      for (const [address, description] of Object.entries(this.appleIIAddresses)) {
        const item = new vscode.CompletionItem(address, vscode.CompletionItemKind.Constant)
        item.detail = description
        item.documentation = new vscode.MarkdownString(`Apple II system address: **${address}**\n\n${description}`)
        items.push(item)
      }
    }

    // Common assembler directives
    const directives = [".org", ".byte", ".word", ".text", ".include"]
    for (const directive of directives) {
      const item = new vscode.CompletionItem(directive, vscode.CompletionItemKind.Snippet)
      item.detail = "Assembler directive"
      items.push(item)
    }

    return items
  }

  private provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
    const range = document.getWordRangeAtPosition(position)
    if (!range) {
      return undefined
    }

    const word = document.getText(range).toLowerCase()

    // Check if it's an instruction
    const instruction = this.instructions.find(inst => inst.mnemonic === word)
    if (instruction) {
      const markdown = new vscode.MarkdownString()
      markdown.appendMarkdown(`**${instruction.mnemonic.toUpperCase()}** - ${instruction.description}\n\n`)
      markdown.appendMarkdown(`Addressing modes: \`${instruction.addressing.join(", ")}\`\n\n`)
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

    const instructionName = instructionMatch[1].toLowerCase()
    const instruction = this.instructions.find(inst => inst.mnemonic === instructionName)
    
    if (!instruction) {
      return undefined
    }

    const signatureHelp = new vscode.SignatureHelp()
    const signature = new vscode.SignatureInformation(`${instruction.mnemonic} - ${instruction.description}`)
    signature.documentation = new vscode.MarkdownString(
      `Addressing modes: ${instruction.addressing.join(", ")}\n\nCycles: ${instruction.cycles}`
    )
    
    signatureHelp.signatures = [signature]
    signatureHelp.activeSignature = 0
    signatureHelp.activeParameter = 0

    return signatureHelp
  }
}