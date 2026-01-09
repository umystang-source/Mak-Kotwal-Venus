const { Pool } = require('pg');

const testPasswords = ['postgres', 'admin', 'password', '123456', '', 'root'];

async function testConnection(password) {
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'postgres'
  });

  try {
    await pool.query('SELECT version()');
    console.log(`✅ SUCCESS! Password is: "${password}"`);

    // Try to create the database
    try {
      await pool.query('CREATE DATABASE mak_realty;');
      console.log('✅ Database "mak_realty" created successfully!');
    } catch (err) {
      if (err.code === '42P04') {
        console.log('ℹ️  Database "mak_realty" already exists');
      } else {
        console.log('⚠️  Could not create database:', err.message);
      }
    }

    await pool.end();
    return true;
  } catch (err) {
    console.log(`❌ Failed with password "${password}":`, err.message);
    await pool.end();
    return false;
  }
}

async function findPassword() {
  for (const password of testPasswords) {
    console.log(`\nTrying password: "${password}"...`);
    const success = await testConnection(password);
    if (success) {
      console.log(`\n🎉 Found working password: "${password}"`);
      console.log(`\nUpdate your .env file with:`);
      console.log(`DATABASE_URL=postgresql://postgres:${password}@127.0.0.1:5432/mak_realty`);
      return;
    }
  }
  console.log('\n❌ None of the common passwords worked. You may need to reset PostgreSQL password.');
}

findPassword();
