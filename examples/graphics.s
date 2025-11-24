; Apple II Graphics Demo
; Demonstrates lo-res graphics and color patterns
; Load at $0800 and JSR to start

* = $0800

start:
    ; Switch to graphics mode
    STA $C050       ; Graphics mode
    STA $C052       ; Mixed mode off
    STA $C054       ; Page 1
    STA $C056       ; Lo-res graphics
    
    ; Clear graphics screen
    LDX #$00        ; Start at $0400 (graphics page 1)
    LDA #$00        ; Black color
clear_loop:
    STA $0400,X     ; Store to screen
    STA $0500,X     ; Store to screen
    STA $0600,X     ; Store to screen  
    STA $0700,X     ; Store to screen
    INX
    BNE clear_loop  ; Continue until X wraps to 0
    
    ; Draw colored pattern
    LDX #$00
    LDY #$00
    
draw_pattern:
    TXA             ; Transfer X to A
    AND #$0F        ; Mask to 4 bits (16 colors)
    STA $0400,X     ; Store color to screen
    INX
    CPX #$F0        ; Draw 240 pixels
    BNE draw_pattern
    
    ; Animation loop
animation:
    JSR delay       ; Wait a bit
    JSR rotate_colors
    JMP animation   ; Loop forever

rotate_colors:
    LDX #$EF        ; Start from end
rotate_loop:
    LDA $0400,X     ; Get current color
    CLC
    ADC #$01        ; Add 1 to color
    AND #$0F        ; Keep in range 0-15
    STA $0400,X     ; Store back
    DEX
    BPL rotate_loop ; Continue until X < 0
    RTS

delay:
    LDY #$FF        ; Outer loop counter
delay_outer:
    LDX #$FF        ; Inner loop counter
delay_inner:
    NOP
    DEX
    BNE delay_inner
    DEY
    BNE delay_outer
    RTS

; Alternative simple text demo
text_demo:
    ; Switch to text mode
    STA $C051       ; Text mode
    
    ; Clear screen
    LDX #$00
    LDA #$A0        ; Space character (normal video)
clear_text:
    STA $0400,X
    STA $0500,X
    STA $0600,X
    STA $0700,X
    INX
    BNE clear_text
    
    ; Write message
    LDX #$00
message_loop:
    LDA message,X
    BEQ done        ; End if null terminator
    STA $0400,X     ; Write to screen
    INX
    JMP message_loop
    
done:
    RTS

message:
    .text "APPLE II ASSEMBLY DEMO"
    .byte $00
; Memory locations for reference:
; $C050 - Graphics mode off
; $C051 - Graphics mode on
; $C052 - Mixed mode off  
; $C053 - Mixed mode on
; $C054 - Page 1
; $C055 - Page 2
; $C056 - Lo-res graphics
; $C057 - Hi-res graphics
; $0400-$07FF - Text/Graphics screen memory