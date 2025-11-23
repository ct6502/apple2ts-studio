# Apple2TS Studio

A Visual Studio Code extension for 6502 assembly programming with an integrated Apple IIe emulator.

## Features

- **6502 Assembly Language Support**
  - Syntax highlighting for 6502 assembly
  - IntelliSense with instruction completion
  - Hover documentation for instructions
  - Apple II specific memory addresses completion

- **Integrated Apple IIe Emulator**
  - Built-in Apple IIe emulator in VS Code
  - Load and run assembled programs directly
  - Visual debugging capabilities
  - Apple II specific features and memory mapping

- **Build System**
  - Support for 64tass assembler toolchain
  - Built-in simple assembler for basic programs
  - F5 to build and run in emulator
  - Assembly output and error reporting

## Installation

### From Source

1. Clone this repository
2. Open in VS Code
3. Install dependencies: `npm install`
4. Press F5 to run the extension in a new Extension Development Host window

### Prerequisites

For advanced assembly features, install the 64tass assembler:

```bash
# macOS with Homebrew
brew install 64tass

# Ubuntu/Debian  
sudo apt-get install 64tass

# Windows
# Download from https://sourceforge.net/projects/tass64/
```

## Usage

### Creating a 6502 Assembly File

1. Create a new file with extension `.s`, `.asm`, or `.a65`
2. Start typing 6502 assembly instructions
3. Use IntelliSense (Ctrl+Space) for instruction completion

### Example Program

```assembly
; Simple Hello World for Apple II using 64tass syntax
        * = $0800

start:
        lda #$48        ; Load 'H'
        sta $0400       ; Store to screen
        lda #$45        ; Load 'E'  
        sta $0401       ; Store to screen
        ; ... more instructions
        rts
```

### Building and Running

1. Open a 6502 assembly file
2. Press F5 or use Command Palette: "Apple2TS: Build & Run in Emulator"
3. The emulator window will open and your program will be loaded
4. Press 'R' in the emulator to run the program

### Commands

- **Apple2TS: Launch Apple IIe Emulator** - Opens the emulator panel
- **Apple2TS: Build & Run in Emulator** - Assembles current file and runs in emulator
- **Apple2TS: Assemble Current File** - Assembles without running

## 6502 Instruction Set

The extension provides complete support for the 6502 instruction set with:

- All official opcodes (ADC, AND, ASL, BCC, etc.)
- Multiple addressing modes
- Cycle count information
- Detailed instruction documentation

## Apple II Features

- Memory-mapped I/O locations ($C000-$CFFF)
- Screen memory ($0400-$07FF for text mode)
- Common system addresses and vectors
- Apple II specific assembler directives

## Configuration

Configure the extension in VS Code settings:

```json
{
    "apple2ts.assembler.path": "64tass",
    "apple2ts.assembler.args": "-a --apple-ii --m65c02"
}
```

## Development

### Project Structure

```
apple2ts-studio/
├── src/
│   ├── extension.ts          # Main extension file
│   ├── emulatorPanel.ts      # Webview-based emulator
│   ├── assembler.ts          # Assembly toolchain integration
│   └── languageFeatures.ts  # Language server features
├── syntaxes/
│   └── asm6502.tmGrammar.json # Syntax highlighting
├── media/
│   ├── emulator.js           # Emulator implementation
│   └── emulator.css          # Emulator styling
└── examples/
    └── hello.s               # Sample assembly program
```

### Building

```bash
npm install
npm run compile
```

### Packaging

```bash
npm run package
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Full Apple2TS emulator integration
- [ ] Debugging with breakpoints
- [ ] Disk image support
- [ ] Graphics mode support
- [ ] Sound emulation
- [ ] Save/restore emulator state
- [ ] Assembly project templates
- [ ] Advanced macro support

## Acknowledgments

- Based on the Apple2TS TypeScript Apple IIe emulator
- 6502 processor documentation and references
- VS Code extension development guides