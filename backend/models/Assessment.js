const supabase = require('../config/supabaseClient');

const ASSESSMENTS_TABLE = 'assessments';

async function createAssessment(payload) {
  const { data, error } = await supabase.from(ASSESSMENTS_TABLE).insert([payload]).select().single();
  if (error) throw error;
  return data;
}

async function getAssessmentsByUserId(userId) {
  const { data, error } = await supabase
    .from(ASSESSMENTS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getLatestAssessmentByUserId(userId) {
  const { data, error } = await supabase
    .from(ASSESSMENTS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Returns all assessments for analytics dashboard (existing schema, no changes)
async function getAllAssessments() {
  const { data, error } = await supabase
    .from(ASSESSMENTS_TABLE)
    .select('id, user_id, total_score, result, created_at, gender, age_group')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

module.exports = {
  createAssessment,
  getAssessmentsByUserId,
  getLatestAssessmentByUserId,
  getAllAssessments
};

