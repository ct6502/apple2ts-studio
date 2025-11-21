; Simple Apple II "Hello World" program
; This demonstrates basic 6502 assembly programming using 64tass syntax

        * = $0800          ; Start at $0800 (standard Apple II program location)

start:
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

        rts             ; Return from subroutine