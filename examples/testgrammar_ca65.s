; CA65 Grammar Test File
; Testing all CA65-specific directives and syntax

; CPU and memory configuration
.setcpu "65C02"
.zeropage
.segment "CODE"

; Data definition
.res 10         ; Reserve 10 bytes
.byte $41, $42  ; Byte data
.word $1234     ; Word data
.addr main      ; Address
.dbyt $1234     ; Double byte (high/low)

; Text and strings
.text "Hello World"

; File inclusion
; .include "macros.inc"

; Procedures
.proc myproc
    rts
.endproc

; Macros
.macro PRINT_CHAR char
    lda #char
    jsr $FDED
.endmacro

; Conditional assembly
.if 1
    ; Code here
.endif

.ifdef DEBUG
    ; Debug code
.endif

.ifndef RELEASE
    ; Non-release code
.endif

; Origin and scoping
.org $0800
.scope
    ; Local scope
.endscope

; Labels (supported syntax)
main:           ; Standard label
@local:         ; Local label
symbol          ; Symbol without colon

; Numbers
$FF             ; Hex
%10101010       ; Binary
255             ; Decimal

; Strings
"Double quoted string"
'Single quoted string'
"Escaped \"quote\""

; Comments
; This is a comment