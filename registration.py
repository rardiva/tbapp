from flask import Flask, request, jsonify
import psycopg2

app = Flask(__name__)

# Supabase PostgreSQL connection
conn = psycopg2.connect(
    dbname="your_db_name",
    user="your_db_user",
    password="your_db_password",
    host="your_db_host",
    port="your_db_port"
)
cursor = conn.cursor()

@app.route('/register', methods=['POST'])
def register():
    data = request.form
    username = data['username']
    password = data['password']

    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
    conn.commit()
    
    return jsonify({'message': 'User registered successfully!'})

if __name__ == '__main__':
    app.run(debug=True)
