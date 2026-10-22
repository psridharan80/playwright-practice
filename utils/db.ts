import mysql from 'mysql2/promise';

// Connection settings come from .env (see .env.example)
function dbConfig() {
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

export type DbUser = {
  firstName: string;
  lastName: string;
  phone: string;
  occupation: string;
  gender: 'Male' | 'Female';
  email: string;
};

// The site only offers these occupations, so map the DB value onto one of them
function toSiteOccupation(occupation: string | null): string {
  const value = (occupation ?? '').toLowerCase();
  if (value.includes('engineer')) return 'Engineer';
  if (value.includes('nurse') || value.includes('doctor')) return 'Doctor';
  if (value.includes('scien')) return 'Scientist';
  return 'Student';
}

// Pick one random user from the Users table in the e2e-mysql container
export async function getRandomUser(): Promise<DbUser> {
  const connection = await mysql.createConnection(dbConfig());
  try {
    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT FirstName, LastName, PhoneNumber, Occupation, Gender, Email FROM Users ORDER BY RAND() LIMIT 1',
    );
    if (rows.length === 0) throw new Error('Users table is empty');
    const row = rows[0];
    return {
      firstName: row.FirstName,
      lastName: row.LastName,
      phone: row.PhoneNumber,
      occupation: toSiteOccupation(row.Occupation),
      gender: row.Gender,
      email: row.Email,
    };
  } finally {
    await connection.end();
  }
}