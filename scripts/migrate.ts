import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import 'dotenv/config';

const runMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: 'db/migrations' });
  console.log('Migrations completed!');
  
  await sql.end();
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('Migration failed');
  console.error(err);
  process.exit(1);
});
