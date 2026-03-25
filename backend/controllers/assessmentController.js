const {
  createAssessment,
  getAssessmentsByUserId,
  getLatestAssessmentByUserId,
  getAllAssessments
} = require('../models/Assessment');
const { updateAssessmentCompleted } = require('../models/User');
const { sendAssessmentReport } = require('../services/emailService');

function getAdultResult(score) {
  if (score <= 20) return 'Unlikely ADHD';
  if (score <= 40) return 'Possible ADHD traits';
  return 'High likelihood of ADHD';
}

function getKidResult(score) {
  if (score <= 15) return 'Unlikely ADHD';
  if (score <= 30) return 'Possible ADHD traits';
  return 'High likelihood of ADHD';
}

exports.submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id;

    // One test per user: if any record exists, block retake and return latest result.
    const existing = await getLatestAssessmentByUserId(userId);
    if (existing) {
      return res.status(403).json({
        message: 'You have already completed the assessment. Each user can take it only once.',
        latestAssessment: {
          total_score: existing.total_score,
          result: existing.result,
          gender: existing.gender,
          age_group: existing.age_group,
          created_at: existing.created_at
        }
      });
    }

    const { gender, ageGroup, answers } = req.body;

    if (!gender || !ageGroup || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Missing assessment data.' });
    }
    if (answers.length === 0) {
      return res.status(400).json({ message: 'Please answer at least one question.' });
    }

    const totalScore = answers.reduce((sum, val) => sum + Number(val || 0), 0);
    const result = ageGroup === 'Adult' ? getAdultResult(totalScore) : getKidResult(totalScore);
    const now = new Date().toISOString();

    const payload = {
      user_id: userId,
      gender,
      age_group: ageGroup,
      answers,
      total_score: totalScore,
      result,
      created_at: now
    };

    const record = await createAssessment(payload);
    await updateAssessmentCompleted(userId);

    // Send report email (non-blocking: if email fails, result is still saved and returned)
    let emailSent = false;
    try {
      const testDate = new Date(record.created_at).toLocaleString(undefined, {
        dateStyle: 'long',
        timeStyle: 'short'
      });
      emailSent = await sendAssessmentReport({
        to: req.user.email,
        userName: req.user.name,
        score: totalScore,
        result,
        ageGroup,
        testDate
      });
    } catch (emailErr) {
      console.error('Email report error (result still saved):', emailErr);
    }

    return res.status(201).json({
      message: 'Assessment saved successfully.',
      assessment: record,
      emailSent
    });
  } catch (error) {
    console.error('Submit assessment error', error);
    return res.status(500).json({ message: 'Server error while saving assessment.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await getAssessmentsByUserId(userId);

    return res.status(200).json({
      history: records
    });
  } catch (error) {
    console.error('Get history error', error);
    return res.status(500).json({ message: 'Server error while fetching history.' });
  }
};

// Returns all assessments for analytics dashboard (reuses existing stored data)
exports.getAnalytics = async (req, res) => {
  try {
    const records = await getAllAssessments();
    return res.status(200).json({ assessments: records });
  } catch (error) {
    console.error('Get analytics error', error);
    return res.status(500).json({ message: 'Server error while fetching analytics.' });
  }
};

