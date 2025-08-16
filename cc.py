FIRST_CHAR_CODE = ord("A")
LAST_CHAR_CODE = ord("Z")
CHAR_RANGE = LAST_CHAR_CODE - FIRST_CHAR_CODE + 1


def clean_message(message):
    # Keep only alphabets and spaces, convert to uppercase
    return ''.join([char.upper() if char.isalpha() else char
                    for char in message if char.isalpha() or char == " "])


def caesar_shift(message, shift):
    result = ""
    for char in message:
        if char.isalpha():
            char_code = ord(char)
            new_char_code = char_code + shift

            # Wrap around for right shift
            if new_char_code > LAST_CHAR_CODE:
                new_char_code -= CHAR_RANGE

            # Wrap around for left shift
            if new_char_code < FIRST_CHAR_CODE:
                new_char_code += CHAR_RANGE

            result += chr(new_char_code)
        else:
            result += char  # keep spaces as they are
    return result


# --- Main Loop ---
while True:
    choice = input("Do you want to Encrypt or Decrypt? (E/D) or Q to quit: ").strip().upper()
    
    if choice == "Q":
        print("Exiting program. Goodbye!")
        break

    if choice not in ["E", "D"]:
        print("Invalid choice! Please enter E, D, or Q.")
        continue

    message = input("Enter your message: ")
    shift = int(input("Enter number of shifts: "))

    # Clean the message first
    message = clean_message(message)

    if choice == "E":
        shift = shift % CHAR_RANGE  # ensure shift is within range
        output = caesar_shift(message, shift)
    else:  # Decrypt
        shift = (-shift) % CHAR_RANGE
        output = caesar_shift(message, shift)

    print(f"Result: {output}\n")
