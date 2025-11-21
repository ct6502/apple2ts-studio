; Test program to verify Apple2TS emulator is working
; This should display "APPLE2TS" on the Apple II screen

        * = $0800          ; Start at $0800 (standard program location)

start:
        ; Display "APPLE2TS" on the screen
        lda #$41           ; 'A'
        sta $0400          ; Store at screen memory start
        
        lda #$50           ; 'P' 
        sta $0401
        
        lda #$50           ; 'P'
        sta $0402
        
        lda #$4c           ; 'L'
        sta $0403
        
        lda #$45           ; 'E'
        sta $0404
        
        lda #$32           ; '2'
        sta $0405
        
        lda #$54           ; 'T'
        sta $0406
        
        lda #$53           ; 'S'
        sta $0407

        ; Add some screen activity to show it's the real emulator
        ldx #$08           ; Start from position 8
loop:
        lda #$2a           ; '*' character 
        sta $0400,x        ; Store with X offset
        inx                ; Increment X
        cpx #$28           ; Compare with 40 (full line)
        bne loop           ; Branch if not equal

done:
        rts                ; Return (end program)