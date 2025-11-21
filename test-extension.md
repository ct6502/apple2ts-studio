# Testing Apple2TS Studio Extension

## Installation
1. Install the packaged extension:
   ```bash
   code --install-extension apple2ts-studio-0.1.0.vsix
   ```

## Basic Testing

### 1. Test 6502 Assembly Language Support
- Open a new file and save it as `test.s` 
- VS Code should automatically recognize it as 6502 assembly
- Test syntax highlighting with this code:
```assembly
        * = $0800          ; Start address
        lda #$41           ; Load 'A' into accumulator  
        sta $0400          ; Store to screen memory
        rts                ; Return
```

### 2. Test Assembly with 64tass
- Open Command Palette (Cmd+Shift+P)
- Run `Apple2TS: Assemble Current File`
- Should see assembly success message

### 3. Test Emulator Integration
- Open Command Palette (Cmd+Shift+P) 
- Run `Apple2TS: Launch Emulator`
- Should open emulator panel with Apple IIe interface
- Click "Power On" to start the emulator

### 4. Test Program Loading
- With assembly file open, assemble it first
- In emulator panel, click "Run Program" 
- Should load and execute the assembled program

## Example Program
Use the hello world example from `examples/hello.s`:

```assembly
; Simple Apple II "Hello World" program
        * = $0800          ; Start at $0800 
start:
        lda #$48           ; Load 'H'
        sta $0400          ; Store to screen memory (top-left)
        lda #$45           ; Load 'E'  
        sta $0401          ; Store to next position
        ; ... continues for HELLO WORLD
loop:
        nop                ; No operation
        jmp loop           ; Infinite loop
        rts                ; Return
```

## Expected Results
- Syntax highlighting should work for 6502 assembly
- Assembly should produce binary output using 64tass
- Emulator should display Apple IIe interface
- Programs should load and display text on emulated screen
- Basic 6502 instruction execution should work (LDA, STA, JMP, etc.)

## Troubleshooting
- If assembly fails, check that 64tass is installed (`brew install 64tass`)
- If emulator doesn't start, check browser console for errors
- Programs load at $0800, Apple II screen memory starts at $0400