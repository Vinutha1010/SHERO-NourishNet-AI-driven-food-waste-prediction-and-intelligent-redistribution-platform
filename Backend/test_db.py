import mysql.connector

passwords_to_test = ['admin', 'root', '', '1234', '123456', 'password', 'admin123', 'root123', 'mysql']

print("--- Testing MySQL Root Passwords ---")
found = False

for pwd in passwords_to_test:
    try:
        conn = mysql.connector.connect(
            host='127.0.0.1',
            user='root',
            password=pwd
        )
        if conn.is_connected():
            print(f"\nSUCCESS! Your correct MySQL root password is: '{pwd}'")
            conn.close()
            found = True
            break
    except mysql.connector.Error as e:
        print(f"Tested password '{pwd}': Access denied")

if not found:
    print("\nNone of the common passwords worked. Please check MySQL Workbench connection properties.")
