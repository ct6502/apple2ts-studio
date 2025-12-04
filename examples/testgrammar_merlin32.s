; Merlin32 Grammar Test File
; Testing all Merlin32-specific directives and syntax

; Special DSK directive for output file
        DSK testgrammar_merlin32

; Origin
        ORG $0800

; Equates
SCREEN  EQU $0400
CHAR_A  equ $41

; File operations
        USE Apple2e.s      ; Include system equates
;       PUT myfile.s       ; Include source file
        SAV testprogram    ; Save object file

; Listing control
        LST ON             ; Listing on
        LST OFF            ; Listing off

; Symbol export
        EXP SCREEN         ; Export symbol

; Error generation
;       ERR "This is an error message"

; End of file
;       FIN

; Conditional assembly
        DO 1
        ; Code here
        ELSE
        ; Alternative code
        ENDIF

; Macros
        MACRO
        PRINT_CHAR
        lda #]1
        jsr $FDED
        <<<

        PMACRO
        DELAY
        ldx #]1
]LOOP   dex
        bne ]LOOP
        EOM
:LOOP2  bra :LOOP2

; Data definition
        HEX 414243         ; Hex data
        ASC "Hello"        ; ASCII string
        DCI "Last char inverted"
        INV "Inverted text"
        FLS "Flashing text"
        STR "Pascal string"
        STRL "Long pascal string"

; Numeric data
        DA main            ; Address
        DDB $1234          ; Double byte
        DFB $41,$42,$43    ; Define bytes
        DW $1234,$5678     ; Define words
        ADRL main          ; Long address
        REL main           ; Relative address

; Labels (supported syntax)
main                       ; Standard label
@local                     ; Local label
symbol:                    ; Symbol with colon

; Numbers
$FF                        ; Hex
%10101010                  ; Binary
255                        ; Decimal

; Strings
"Double quoted string"
'Single quoted string'
"Escaped \"quote\""

; Comments
; This is a comment