document.addEventListener('DOMContentLoaded', () => {
    const steps = [
        {
            key: 'student_name',
            title: 'Your name',
            html: `
                <div class="input-group">
                    <label for="student_name">Full name</label>
                    <input id="student_name" type="text" placeholder="Aatif" autocomplete="name" />
                </div>
                <p class="hint">Use the name you want the coach to call you.</p>
            `
        },
        {
            key: 'goal',
            title: 'Learning goal',
            html: `
                <div class="input-group">
                    <label for="goal">What are you trying to achieve?</label>
                    <textarea id="goal" rows="4" placeholder="Master AI fundamentals and build a study habit"></textarea>
                </div>
            `
        },
        {
            key: 'skill_level',
            title: 'Current level',
            html: `
                <div class="input-group">
                    <label for="skill_level">How confident are you right now?</label>
                    <select id="skill_level">
                        <option value="">Choose one</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                    </select>
                </div>
            `
        },
        {
            key: 'study_time',
            title: 'Study time',
            html: `
                <div class="input-group">
                    <label for="study_time">Hours per week</label>
                    <input id="study_time" type="number" min="1" max="80" placeholder="10" />
                </div>
            `
        },
        {
            key: 'learning_style',
            title: 'Learning style',
            html: `
                <div class="input-group">
                    <label for="learning_style">What works best for you?</label>
                    <select id="learning_style">
                        <option value="">Choose one</option>
                        <option>Visual</option>
                        <option>Auditory</option>
                        <option>Reading/Writing</option>
                        <option>Kinesthetic</option>
                    </select>
                </div>
            `
        },
        {
            key: 'review',
            title: 'Review profile',
            html: `
                <div class="summary" id="summaryBox"></div>
                <p class="hint" style="margin-top:14px">Tap Finish to save everything locally and open your dashboard.</p>
            `
        }
    ];

   const stepContainer = document.getElementById('stepContainer');
    const stepIndicator = document.getElementById('stepIndicator');
    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');

    let currentStep = 0;
    const draft = loadDraft();

    function loadDraft() {
        try {
            const saved = localStorage.getItem('student_profile_draft');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    function saveDraft() {
        localStorage.setItem('student_profile_draft', JSON.stringify(draft));
    }

    function renderIndicator() {
        stepIndicator.innerHTML = steps
            .map((_, index) => `<span class="dot ${index === currentStep ? 'active' : ''}"></span>`)
            .join('');
    }

    function renderStep() {
        const step = steps[currentStep];
        stepContainer.innerHTML = `
            <section class="step active">
                <h2>${step.title}</h2>
                ${step.html}
            </section>
        `;

        renderIndicator();
        btnBack.disabled = currentStep === 0;
        btnNext.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next';

        restoreValues();

        if (step.key === 'review') {
            fillSummary();
        }
    }

    function restoreValues() {
        steps.forEach(({ key }) => {
            if (key === 'review') return;
            const input = document.getElementById(key);
            if (!input) return;
            if (draft[key] !== undefined) {
                input.value = draft[key];
            }
        });
    }

    function captureCurrentInputs() {
        const activeInputs = stepContainer.querySelectorAll('input, textarea, select');
        activeInputs.forEach((input) => {
            if (input.id) {
                draft[input.id] = input.value.trim();
            }
        });
        saveDraft();
    }

    function fillSummary() {
        const summaryBox = document.getElementById('summaryBox');
        if (!summaryBox) return;

        const lines = [
            ['Name', draft.student_name || 'Student'],
            ['Goal', draft.goal || 'Not set'],
            ['Level', draft.skill_level || 'Not set'],
            ['Study time', draft.study_time ? `${draft.study_time} hours/week` : 'Not set'],
            ['Style', draft.learning_style || 'Not set']
        ];

        summaryBox.innerHTML = lines.map(([label, value]) => `
            <div class="summary-card">
                <div class="label">${label}</div>
                <div class="value">${escapeHtml(value)}</div>
            </div>
        `).join('');
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function inferTopics(goalText, skillLevel) {
        const goal = (goalText || '').toLowerCase();
        const strong = [];
        const weak = [];

        const buckets = [
            { match: ['ai', 'ml', 'machine learning', 'neural'], strong: ['Prompting basics', 'Idea mapping'], weak: ['Neural networks', 'Model tuning'] },
            { match: ['python'], strong: ['Syntax', 'Variables'], weak: ['OOP', 'Debugging'] },
            { match: ['javascript', 'js', 'web'], strong: ['HTML basics', 'UI layout'], weak: ['Async logic', 'State handling'] },
            { match: ['android', 'kotlin'], strong: ['Layouts', 'Simple logic'], weak: ['State management', 'Networking'] },
            { match: ['math', 'calculus', 'algebra'], strong: ['Formula recall', 'Basics'], weak: ['Problem solving', 'Timed practice'] },
            { match: ['science', 'physics', 'chemistry', 'biology'], strong: ['Definitions', 'Core ideas'], weak: ['Application questions', 'Revision'] }
        ];

        const bucket = buckets.find((item) => item.match.some((term) => goal.includes(term)));
        if (bucket) {
            strong.push(...bucket.strong);
            weak.push(...bucket.weak);
        } else {
            strong.push('Study habits', 'Core revision');
            weak.push('Hardest topic', 'Recall practice');
        }

        if ((skillLevel || '').toLowerCase() === 'beginner') {
            weak.unshift('Foundations');
        } else if ((skillLevel || '').toLowerCase() === 'advanced') {
            strong.unshift('Fast recall');
        }

        return { strong, weak };
    }

    function buildMission(goalText, studyTime, weakTopics) {
        const hrs = Number(studyTime) || 5;
        const focusBlock = Math.min(Math.max(Math.round(hrs / 2), 1), 4);
        const weakFocus = weakTopics[0] || 'your toughest topic';
        const goal = goalText || 'your goal';
        return `Spend ${focusBlock} focused blocks on ${goal}. Start with ${weakFocus}, then finish one short recall check before you stop.`;
    }

    function finishProfile() {
        captureCurrentInputs();

        const name = (draft.student_name || 'Student').trim();
        const goal = (draft.goal || 'Build a strong learning routine').trim();
        const skillLevel = draft.skill_level || 'Beginner';
        const studyTime = Number(draft.study_time) || 5;
        const learningStyle = draft.learning_style || 'Visual';
        const topics = inferTopics(goal, skillLevel);

        const profile = {
            student_id: localStorage.getItem('student_id') || `local-${Date.now()}`,
            student_name: name,
            goal,
            skill_level: skillLevel,
            study_time: studyTime,
            learning_style: learningStyle,
            strong_topics: topics.strong,
            weak_topics: topics.weak,
            todays_mission: buildMission(goal, studyTime, topics.weak),
            study_streak: 1,
            average_score: 'Coming Soon',
            progress_percentage: 0,
            achievements: [],
            chat_history: [],
            memory: {
                goal,
                skill_level: skillLevel,
                learning_style: learningStyle,
                interests: [],
                strong_topics: topics.strong,
                weak_topics: topics.weak,
                recent_topics: []
            }
        };

        console.log("PROFILE TO SAVE:");
        console.log(profile);

        localStorage.setItem('student_profile', JSON.stringify(profile));
        localStorage.setItem('student_name', profile.student_name);
        localStorage.setItem('goal', profile.goal);
        localStorage.setItem('skill_level', profile.skill_level);
        localStorage.setItem('study_time', String(profile.study_time));
        localStorage.setItem('learning_style', profile.learning_style);
        localStorage.setItem('strong_topics', JSON.stringify(profile.strong_topics));
        localStorage.setItem('weak_topics', JSON.stringify(profile.weak_topics));
        localStorage.setItem('todays_mission', profile.todays_mission);
        localStorage.setItem('study_streak', String(profile.study_streak));
        localStorage.setItem('average_score', String(profile.average_score));
        localStorage.removeItem('student_profile_draft');

        window.location.href = 'dashboard.html';
    }

    btnBack.addEventListener('click', () => {
        captureCurrentInputs();
        if (currentStep > 0) {
            currentStep -= 1;
            renderStep();
        }
    });

    btnNext.addEventListener('click', () => {
        captureCurrentInputs();

        if (currentStep < steps.length - 1) {
            currentStep += 1;
            renderStep();
        } else {
            finishProfile();
        }
    });

    stepContainer.addEventListener('input', (event) => {
        const { target } = event;
        if (target && target.id) {
            draft[target.id] = target.value;
            saveDraft();
        }
    });

    renderStep();
});
