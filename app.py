from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='ARIA007aria',
        database='database1'
    )
    return connection

@app.route('/details', methods=['GET'])
def get_details():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM details')
    details = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify({'details': details})

@app.route('/add', methods=['POST'])
def add_detail():
    name = request.form['name']
    email = request.form['email']
    dob = request.form['dob']
    phone_number = request.form['phone_number']
    blood_group = request.form['blood_group']

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        'INSERT INTO details (name, email, dob, phone_number, blood_group) VALUES (%s, %s, %s, %s, %s)',
        (name, email, dob, phone_number, blood_group)
    )
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({'success': True, 'detail': {'id': cursor.lastrowid, 'name': name, 'email': email, 'dob': dob, 'phone_number': phone_number, 'blood_group': blood_group}})

@app.route('/update', methods=['PUT'])
def update_detail():
    data = request.json
    name = data['name']
    email = data['email']
    dob = data['dob']
    phone_number = data['phone_number']
    blood_group = data['blood_group']

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        'UPDATE details SET name=%s, dob=%s, phone_number=%s, blood_group=%s WHERE email=%s',
        (name, dob, phone_number, blood_group, email)
    )
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({'success': True, 'detail': {'name': name, 'email': email, 'dob': dob, 'phone_number': phone_number, 'blood_group': blood_group}})

@app.route('/delete', methods=['DELETE'])
def delete_detail():
    email = request.args.get('email')

    if not email:
        return jsonify({'success': False, 'message': 'Email parameter is missing.'}), 400

    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute('DELETE FROM details WHERE email = %s', (email,))
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
