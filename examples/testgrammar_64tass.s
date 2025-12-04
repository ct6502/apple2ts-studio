; 64TASS Grammar Test File
; Testing all 64TASS-specific directives and syntax

; Origin assignment (64TASS specific)
* = $0800

; Data definition
.byte $41, $42  ; Byte data
.word $1234     ; Word data
.text "Hello"   ; Text data

; File inclusion
; .include "macros.inc"

; Procedures
.proc myproc
    rts
.endproc

; Macros
.macro PRINT_CHAR
    lda #\1
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

; Additional origin settings
* = $1000       ; Set new origin
*= $2000        ; No spaces
*   =   $3000   ; Extra spaces

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