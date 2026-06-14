document.addEventListener('DOMContentLoaded', () => {

    const debugDiv = document.getElementById("err");

    let output = "";

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        output += `
    ========================
    ${key}
    ========================
    ${value}

    `;
    }

    debugDiv.innerText = output;

    const fallbackProfile = {
        student_name: 'Student',
        goal: 'Build a strong learning routine',
        skill_level: 'Beginner',
        study_time: 5,
        learning_style: 'Visual',
        strong_topics: [],
        weak_topics: [],
        todays_mission: 'Finish onboarding to generate today’s mission.',
        study_streak: 1,
        average_score: 'Coming Soon',
        progress_percentage: 0,
        achievements: [],
        chat_history: [],
        memory: {}
    };

    function safeParse(value, fallback) {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch {
            return fallback;
        }
    }

    function getProfile() {
        const stored = safeParse(localStorage.getItem('student_profile'), null);
        if (!stored) return null;
        return {
            ...fallbackProfile,
            ...stored,
            strong_topics: Array.isArray(stored.strong_topics) ? stored.strong_topics : [],
            weak_topics: Array.isArray(stored.weak_topics) ? stored.weak_topics : [],
            chat_history: Array.isArray(stored.chat_history) ? stored.chat_history : []
        };
    }

    function saveProfile(profile) {
        localStorage.setItem('student_profile', JSON.stringify(profile));
        localStorage.setItem('student_name', profile.student_name || '');
        localStorage.setItem('goal', profile.goal || '');
        localStorage.setItem('skill_level', profile.skill_level || '');
        localStorage.setItem('study_time', String(profile.study_time || ''));
        localStorage.setItem('learning_style', profile.learning_style || '');
        localStorage.setItem('strong_topics', JSON.stringify(profile.strong_topics || []));
        localStorage.setItem('weak_topics', JSON.stringify(profile.weak_topics || []));
        localStorage.setItem('todays_mission', profile.todays_mission || '');
    }

    function chip(text, kind) {
        return `<span class="topic-pill ${kind || ''}">${escapeHtml(text)}</span>`;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function renderList(container, items, emptyText, kind) {
        if (!container) return;
        if (!items || items.length === 0) {
            container.innerHTML = `<span class="topic-pill">${escapeHtml(emptyText)}</span>`;
            return;
        }
        container.innerHTML = items.map((item) => chip(item, kind)).join('');
    }

    function inferMission(profile) {
        if (profile.todays_mission) return profile.todays_mission;
        const focus = profile.weak_topics[0] || profile.goal || 'your goal';
        return `Spend one focused block on ${focus}, then finish with a quick recall check.`;
    }

    let profile = getProfile();
    if (!profile) {
        window.location.href = 'welcome.html';
        return;
    }

    const studentName = document.getElementById('studentName');
    const goalText = document.getElementById('goalText');
    const missionText = document.getElementById('missionText');
    const strongTopics = document.getElementById('strongTopics');
    const weakTopics = document.getElementById('weakTopics');
    const learningStyle = document.getElementById('learningStyle');
    const studyTime = document.getElementById('studyTime');
    const studyStreak = document.getElementById('studyStreak');
    const averageScore = document.getElementById('averageScore');
    const btnReset = document.getElementById('btnReset');

    if (studentName) studentName.textContent = `Welcome Back, ${profile.student_name || 'Student'} 👋`;
    if (goalText) goalText.textContent = profile.goal || 'No active goal';
    if (missionText) missionText.textContent = inferMission(profile);
    if (learningStyle) learningStyle.textContent = profile.learning_style || 'Visual';
    if (studyTime) studyTime.textContent = profile.study_time ? `${profile.study_time} hours/week` : 'Not set';
    if (studyStreak) studyStreak.textContent = `${profile.study_streak || 1} day${(profile.study_streak || 1) === 1 ? '' : 's'}`;
    if (averageScore) averageScore.textContent = 'Coming Soon';

    renderList(strongTopics, profile.strong_topics, 'No strong topics yet', 'strong');
    renderList(weakTopics, profile.weak_topics, 'No weak topics yet', 'weak');

    if (!profile.chat_history) profile.chat_history = [];
    saveProfile(profile);

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            localStorage.removeItem('student_profile');
            localStorage.removeItem('student_name');
            localStorage.removeItem('goal');
            localStorage.removeItem('skill_level');
            localStorage.removeItem('study_time');
            localStorage.removeItem('learning_style');
            localStorage.removeItem('strong_topics');
            localStorage.removeItem('weak_topics');
            localStorage.removeItem('todays_mission');
            localStorage.removeItem('chat_history');
            localStorage.removeItem('student_profile_draft');
            window.location.href = 'welcome.html';
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && profile && profile.goal) {
            // tiny UX flourish only
        }
    });
});
