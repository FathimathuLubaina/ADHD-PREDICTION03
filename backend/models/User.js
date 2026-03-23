// Simple model helpers for the Supabase "users" table

const supabase = require('../config/supabaseClient');

const USERS_TABLE = 'users';

async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createUser({ name, email, passwordHash }) {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert([
      {
        name,
        email,
        password: passwordHash,
        assessment_completed: false
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateAssessmentCompleted(userId) {
  const { error } = await supabase
    .from(USERS_TABLE)
    .update({ assessment_completed: true })
    .eq('id', userId);

  if (error) throw error;
}

module.exports = {
  findUserByEmail,
  createUser,
  updateAssessmentCompleted
};

