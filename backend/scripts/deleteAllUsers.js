/**
 * One-time script to remove all users and their assessments from the database.
 * Run from backend folder: node scripts/deleteAllUsers.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const supabase = require('../config/supabaseClient');

const USERS_TABLE = 'users';
const ASSESSMENTS_TABLE = 'assessments';

async function deleteAllUsers() {
  console.log('Starting deletion...');

  // 1. Delete all assessments first (they reference user_id via FK)
  const { data: assessments } = await supabase.from(ASSESSMENTS_TABLE).select('id');
  if (assessments && assessments.length > 0) {
    for (const a of assessments) {
      await supabase.from(ASSESSMENTS_TABLE).delete().eq('id', a.id);
    }
    console.log(`Deleted ${assessments.length} assessment(s).`);
  } else {
    console.log('No assessments to delete.');
  }

  // 2. Delete all users
  const { data: users, error: usersErr } = await supabase
    .from(USERS_TABLE)
    .select('id, email');

  if (usersErr) {
    console.error('Error fetching users:', usersErr);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('No users to delete.');
    process.exit(0);
  }

  for (const user of users) {
    const { error } = await supabase.from(USERS_TABLE).delete().eq('id', user.id);
    if (error) {
      console.error('Failed to delete user', user.email, error.message);
    } else {
      console.log('Deleted user:', user.email);
    }
  }

  console.log('Done. All users and assessments removed.');
}

deleteAllUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
