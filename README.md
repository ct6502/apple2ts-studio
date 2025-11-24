# Apple2TS Studio

A Visual Studio Code extension for 6502 assembly programming with an integrated Apple IIe emulator.

## Features

- **6502 Assembly Language Support**
  - Syntax highlighting for 6502 assembly
  - IntelliSense with instruction completion
  - Hover documentation for instructions
  - Apple II specific memory address completion

- **Integrated Apple IIe Emulator**
  - Built-in Apple IIe emulator via [Apple2TS](https://github.com/ct6502/apple2ts)
  - Load and run assembled programs directly
  - Visual debugging capabilities
  - Apple II specific features and memory mapping

- **Build System**
  - Support for 64tass assembler toolchain
  - Built-in simple assembler
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
# macOS with MacPorts
sudo port install 64tass

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
│   ├── assembler.ts          # Assembly toolchain integration
│   ├── emulatorPanel.ts      # Webview-based emulator
│   ├── extension.ts          # Main extension file
│   └── languageFeatures.ts  # Language server features
├── syntaxes/
│   └── asm6502.tmGrammar.json # Syntax highlighting
└── examples/
    └── hello.s               # Sample assembly program
    └── graphics.s            # Sample assembly program
    └── 65c02_complete_demo.s # All 65c02 instructions and address modes
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

### Installing and Reload

```bash
code --install-extension *.vsix --force
```

## Update CHANGELOG

Install the [Github Changelog Generator](https://github.com/github-changelog-generator/github-changelog-generator) by running:

```sh
gem install github_changelog_generator
```

You may need to update to Ruby v3.x to install this gem.

Go through the commits, and add any missing tags. For a given commit sha (say `1befdec`), checkout the commit, force the date to be the commit date, and then add the tag:

```sh
git checkout 1befdec  # skip this if you want changelog for most recent code
GIT_COMMITTER_DATE="$(git show --format=%aD | head -1)"
git tag -a v0.9 -m"v0.9"  # bump this each time, and change it here as well
git push origin --tags
git checkout main
```

If you don't already have one, [generate a Github token](https://github.com/settings/tokens/new?description=GitHub%20Changelog%20Generator%20token) to run the Changelog Generator script with authentication. You only need "repo" scope for private repositories.

Now run the script:

```sh
github_changelog_generator --token xxxxx -u ct6502 -p apple2ts
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