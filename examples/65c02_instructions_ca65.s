;================================
; 65C02 Complete Instruction Set Demonstration
; This program demonstrates every 65C02 instruction and addressing mode
;================================

.p02                     ; Enable 65C02 instructions

; Zero page variables
.org $00
zp_var1:     .res 1      ; $00
zp_var2:     .res 1      ; $01
zp_ptr:      .res 2      ; $02-$03
zp_temp:     .res 1      ; $04

; RAM variables  
.org $0300
ram_var1:    .res 1
ram_var2:    .res 1
ram_table:   .res 16
ram_ptr:     .res 2

; Code segment
.org $0800

main:
    ; Initialize some test values
    LDA #$42
    STA zp_var1
    LDA #$24
    STA zp_var2

;================================
; ADC - Add with Carry
;================================
adc_demo:
    CLC                     ; Clear carry
    LDA #$10
    ADC #$20                ; ADC Immediate
    ADC zp_var1             ; ADC Zero Page
    ADC zp_var1,X           ; ADC Zero Page,X
    ADC ram_var1            ; ADC Absolute
    ADC ram_var1,X          ; ADC Absolute,X
    ADC ram_var1,Y          ; ADC Absolute,Y
    ADC (zp_ptr,X)          ; ADC (Zero Page,X)
    ADC (zp_ptr),Y          ; ADC (Zero Page),Y
    ADC (zp_ptr)            ; ADC (Zero Page) - 65C02 only

;================================
; AND - Logical AND
;================================
and_demo:
    LDA #$FF
    AND #$0F                ; AND Immediate
    AND zp_var1             ; AND Zero Page
    AND zp_var1,X           ; AND Zero Page,X
    AND ram_var1            ; AND Absolute
    AND ram_var1,X          ; AND Absolute,X
    AND ram_var1,Y          ; AND Absolute,Y
    AND (zp_ptr,X)          ; AND (Zero Page,X)
    AND (zp_ptr),Y          ; AND (Zero Page),Y
    AND (zp_ptr)            ; AND (Zero Page) - 65C02 only

;================================
; ASL - Arithmetic Shift Left
;================================
asl_demo:
    LDA #$40
    ASL A                   ; ASL Accumulator
    ASL zp_var1             ; ASL Zero Page
    ASL zp_var1,X           ; ASL Zero Page,X
    ASL ram_var1            ; ASL Absolute
    ASL ram_var1,X          ; ASL Absolute,X

;================================
; BCC/BCS/BEQ/BMI/BNE/BPL/BVC/BVS - Branch instructions
;================================
branch_demo:
    CLC
    BCC branch_target       ; Branch if Carry Clear
    SEC
    BCS branch_target       ; Branch if Carry Set
    LDA #$00
    BEQ branch_target       ; Branch if Equal (Zero)
    LDA #$80
    BMI branch_target       ; Branch if Minus (Negative)
    LDA #$01
    BNE branch_target       ; Branch if Not Equal (Not Zero)
    LDA #$7F
    BPL branch_target       ; Branch if Plus (Positive)
    CLV
    BVC branch_target       ; Branch if Overflow Clear
    ; Note: Can't easily set overflow flag without arithmetic
branch_target:
    BRA continue1           ; Branch Always (65C02 only)
continue1:

;================================
; BIT - Test Bits
;================================
bit_demo:
    LDA #$FF
    BIT #$80                ; BIT Immediate (65C02 only)
    BIT zp_var1             ; BIT Zero Page
    BIT zp_var1,X           ; BIT Zero Page,X (65C02 only)
    BIT ram_var1            ; BIT Absolute
    BIT ram_var1,X          ; BIT Absolute,X (65C02 only)

;================================
; CMP - Compare Accumulator
;================================
cmp_demo:
    LDA #$50
    CMP #$50                ; CMP Immediate
    CMP zp_var1             ; CMP Zero Page
    CMP zp_var1,X           ; CMP Zero Page,X
    CMP ram_var1            ; CMP Absolute
    CMP ram_var1,X          ; CMP Absolute,X
    CMP ram_var1,Y          ; CMP Absolute,Y
    CMP (zp_ptr,X)          ; CMP (Zero Page,X)
    CMP (zp_ptr),Y          ; CMP (Zero Page),Y
    CMP (zp_ptr)            ; CMP (Zero Page) - 65C02 only

;================================
; CPX - Compare X Register
;================================
cpx_demo:
    LDX #$30
    CPX #$30                ; CPX Immediate
    CPX zp_var1             ; CPX Zero Page
    CPX ram_var1            ; CPX Absolute

;================================
; CPY - Compare Y Register
;================================
cpy_demo:
    LDY #$40
    CPY #$40                ; CPY Immediate
    CPY zp_var1             ; CPY Zero Page
    CPY ram_var1            ; CPY Absolute

;================================
; DEC - Decrement
;================================
dec_demo:
    DEC A                   ; DEC Accumulator (65C02 only)
    DEC zp_var1             ; DEC Zero Page
    DEC zp_var1,X           ; DEC Zero Page,X
    DEC ram_var1            ; DEC Absolute
    DEC ram_var1,X          ; DEC Absolute,X

;================================
; DEX/DEY - Decrement X/Y
;================================
    DEX                     ; Decrement X
    DEY                     ; Decrement Y

;================================
; EOR - Exclusive OR
;================================
eor_demo:
    LDA #$FF
    EOR #$AA                ; EOR Immediate
    EOR zp_var1             ; EOR Zero Page
    EOR zp_var1,X           ; EOR Zero Page,X
    EOR ram_var1            ; EOR Absolute
    EOR ram_var1,X          ; EOR Absolute,X
    EOR ram_var1,Y          ; EOR Absolute,Y
    EOR (zp_ptr,X)          ; EOR (Zero Page,X)
    EOR (zp_ptr),Y          ; EOR (Zero Page),Y
    EOR (zp_ptr)            ; EOR (Zero Page) - 65C02 only

;================================
; Flag Instructions
;================================
flag_demo:
    CLC                     ; Clear Carry
    CLD                     ; Clear Decimal
    CLI                     ; Clear Interrupt Disable
    CLV                     ; Clear Overflow
    SEC                     ; Set Carry
    SED                     ; Set Decimal
    SEI                     ; Set Interrupt Disable

;================================
; INC - Increment
;================================
inc_demo:
    INC A                   ; INC Accumulator (65C02 only)
    INC zp_var1             ; INC Zero Page
    INC zp_var1,X           ; INC Zero Page,X
    INC ram_var1            ; INC Absolute
    INC ram_var1,X          ; INC Absolute,X

;================================
; INX/INY - Increment X/Y
;================================
    INX                     ; Increment X
    INY                     ; Increment Y

;================================
; JMP - Jump
;================================
jmp_demo:
    JMP jump_target         ; JMP Absolute
    JMP (ram_ptr)         ; JMP Indirect (would jump away)
    JMP (ram_ptr,X)       ; JMP (Absolute,X) - 65C02 only

;================================
; BRK - Force Break
;================================
    BRK                   ; Put here to check chromacoding but not break

jump_target:

;================================
; JSR/RTS - Jump to Subroutine / Return from Subroutine
;================================
    JSR subroutine          ; Jump to Subroutine
    BRA after_sub
    
subroutine:
    NOP                     ; Do something in subroutine
    RTS                     ; Return from Subroutine

after_sub:

;================================
; LDA - Load Accumulator
;================================
lda_demo:
    LDA #$55                ; LDA Immediate
    LDA zp_var1             ; LDA Zero Page
    LDA zp_var1,X           ; LDA Zero Page,X
    LDA ram_var1            ; LDA Absolute
    LDA ram_var1,X          ; LDA Absolute,X
    LDA ram_var1,Y          ; LDA Absolute,Y
    LDA (zp_ptr,X)          ; LDA (Zero Page,X)
    LDA (zp_ptr),Y          ; LDA (Zero Page),Y
    LDA (zp_ptr)            ; LDA (Zero Page) - 65C02 only

;================================
; LDX - Load X Register
;================================
ldx_demo:
    LDX #$66                ; LDX Immediate
    LDX zp_var1             ; LDX Zero Page
    LDX zp_var1,Y           ; LDX Zero Page,Y
    LDX ram_var1            ; LDX Absolute
    LDX ram_var1,Y          ; LDX Absolute,Y

;================================
; LDY - Load Y Register
;================================
ldy_demo:
    LDY #$77                ; LDY Immediate
    LDY zp_var1             ; LDY Zero Page
    LDY zp_var1,X           ; LDY Zero Page,X
    LDY ram_var1            ; LDY Absolute
    LDY ram_var1,X          ; LDY Absolute,X

;================================
; LSR - Logical Shift Right
;================================
lsr_demo:
    LDA #$80
    LSR A                   ; LSR Accumulator
    LSR zp_var1             ; LSR Zero Page
    LSR zp_var1,X           ; LSR Zero Page,X
    LSR ram_var1            ; LSR Absolute
    LSR ram_var1,X          ; LSR Absolute,X

;================================
; NOP - No Operation
;================================
    NOP                     ; No Operation

;================================
; ORA - Logical OR
;================================
ora_demo:
    LDA #$00
    ORA #$0F                ; ORA Immediate
    ORA zp_var1             ; ORA Zero Page
    ORA zp_var1,X           ; ORA Zero Page,X
    ORA ram_var1            ; ORA Absolute
    ORA ram_var1,X          ; ORA Absolute,X
    ORA ram_var1,Y          ; ORA Absolute,Y
    ORA (zp_ptr,X)          ; ORA (Zero Page,X)
    ORA (zp_ptr),Y          ; ORA (Zero Page),Y
    ORA (zp_ptr)            ; ORA (Zero Page) - 65C02 only

;================================
; PHA/PHP/PHX/PHY - Push to Stack
;================================
push_demo:
    PHA                     ; Push Accumulator
    PHP                     ; Push Processor Status
    PHX                     ; Push X (65C02 only)
    PHY                     ; Push Y (65C02 only)

;================================
; PLA/PLP/PLX/PLY - Pull from Stack
;================================
pull_demo:
    PLY                     ; Pull Y (65C02 only)
    PLX                     ; Pull X (65C02 only)
    PLP                     ; Pull Processor Status
    PLA                     ; Pull Accumulator

;================================
; ROL - Rotate Left
;================================
rol_demo:
    CLC
    LDA #$40
    ROL A                   ; ROL Accumulator
    ROL zp_var1             ; ROL Zero Page
    ROL zp_var1,X           ; ROL Zero Page,X
    ROL ram_var1            ; ROL Absolute
    ROL ram_var1,X          ; ROL Absolute,X

;================================
; ROR - Rotate Right
;================================
ror_demo:
    SEC
    LDA #$01
    ROR A                   ; ROR Accumulator
    ROR zp_var1             ; ROR Zero Page
    ROR zp_var1,X           ; ROR Zero Page,X
    ROR ram_var1            ; ROR Absolute
    ROR ram_var1,X          ; ROR Absolute,X

;================================
; RTI - Return from Interrupt
;================================
    ; RTI                   ; Commented out - would return from non-existent interrupt

;================================
; SBC - Subtract with Carry
;================================
sbc_demo:
    SEC                     ; Set carry for subtraction
    LDA #$50
    SBC #$20                ; SBC Immediate
    SBC zp_var1             ; SBC Zero Page
    SBC zp_var1,X           ; SBC Zero Page,X
    SBC ram_var1            ; SBC Absolute
    SBC ram_var1,X          ; SBC Absolute,X
    SBC ram_var1,Y          ; SBC Absolute,Y
    SBC (zp_ptr,X)          ; SBC (Zero Page,X)
    SBC (zp_ptr),Y          ; SBC (Zero Page),Y
    SBC (zp_ptr)            ; SBC (Zero Page) - 65C02 only

;================================
; STA - Store Accumulator
;================================
sta_demo:
    LDA #$88
    STA zp_var2             ; STA Zero Page
    STA zp_var2,X           ; STA Zero Page,X
    STA ram_var2            ; STA Absolute
    STA ram_var2,X          ; STA Absolute,X
    STA ram_var2,Y          ; STA Absolute,Y
    STA (zp_ptr,X)          ; STA (Zero Page,X)
    STA (zp_ptr),Y          ; STA (Zero Page),Y
    STA (zp_ptr)            ; STA (Zero Page) - 65C02 only

;================================
; STX - Store X Register
;================================
stx_demo:
    LDX #$99
    STX zp_var2             ; STX Zero Page
    STX zp_var2,Y           ; STX Zero Page,Y
    STX ram_var2            ; STX Absolute

;================================
; STY - Store Y Register
;================================
sty_demo:
    LDY #$AA
    STY zp_var2             ; STY Zero Page
    STY zp_var2,X           ; STY Zero Page,X
    STY ram_var2            ; STY Absolute

;================================
; STZ - Store Zero (65C02 only)
;================================
stz_demo:
    STZ zp_var2             ; STZ Zero Page
    STZ zp_var2,X           ; STZ Zero Page,X
    STZ ram_var2            ; STZ Absolute
    STZ ram_var2,X          ; STZ Absolute,X

;================================
; TAX/TAY/TXA/TYA/TSX/TXS - Transfer instructions
;================================
transfer_demo:
    LDA #$BB
    TAX                     ; Transfer A to X
    TAY                     ; Transfer A to Y
    TXA                     ; Transfer X to A
    TYA                     ; Transfer Y to A
    TSX                     ; Transfer Stack Pointer to X
    TXS                     ; Transfer X to Stack Pointer

;================================
; TRB/TSB - Test and Reset/Set Bits (65C02 only)
;================================
test_bits_demo:
    LDA #$0F
    TRB zp_var1             ; Test and Reset Bits Zero Page
    TRB ram_var1            ; Test and Reset Bits Absolute
    TSB zp_var1             ; Test and Set Bits Zero Page
    TSB ram_var1            ; Test and Set Bits Absolute

;================================
; WAI/STP - Wait for Interrupt / Stop (65C02 only)
;================================
    ; WAI                   ; Wait for Interrupt (commented out)
    ; STP                   ; Stop processor (commented out)


        lda #$48        ; Load 'H' into accumulator
        sta $0400       ; Store to screen memory (top-left corner)
        
        lda #$45        ; Load 'E' into accumulator  
        sta $0401       ; Store to next screen position
        
        lda #$4c        ; Load 'L' into accumulator
        sta $0402       ; Store to screen
        
        lda #$4c        ; Load 'L' into accumulator
        sta $0403       ; Store to screen
        
        lda #$4f        ; Load 'O' into accumulator
        sta $0404       ; Store to screen
        
        lda #$20        ; Load space character
        sta $0405       ; Store to screen
        
        lda #$57        ; Load 'W' into accumulator
        sta $0406       ; Store to screen
        
        lda #$4f        ; Load 'O' into accumulator
        sta $0407       ; Store to screen
        
        lda #$52        ; Load 'R' into accumulator
        sta $0408       ; Store to screen
        
        lda #$4c        ; Load 'L' into accumulator
        sta $0409       ; Store to screen
        
        lda #$44        ; Load 'D' into accumulator
        sta $040a       ; Store to screen

loop:
        nop             ; No operation
        jmp loop        ; Infinite loop
