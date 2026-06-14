/* Welcome onboarding – core logic */
document.addEventListener('DOMContentLoaded', () => {
    const steps = [
        {
            title: "Your Name",
            content: `
                <div class="input-group">
                    <label for="student_name">Full Name</label>
                    <input type="text" id="student_name" placeholder="e.g., Alex Johnson" required>
                </div>
            `
        },
        {
            title: "Learning Goal",
            content: `
                <div class="input-group">
                    <label for="goal">What do you want to achieve?</label>
                    <textarea id="goal" rows="3" placeholder="e.g., Master Data Structures in 3 months" required></textarea>
                </div>
            `
        },
        {
            title: "Skill Level",
            content: `
                <div class="input-group">
                    <label for="skill_level">Current proficiency</label>
                    <select id="skill_level" required>
                        <option value="" disabled selected>Select level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
            `
        },
        {
            title: "Study Time",
            content: `
                <div class="input-group">
                    <label for="study_time">Hours per week you can commit</label>
                    <input type="number" id="study_time" min="1" max="40" placeholder="e.g., 10" required>
                </div>
            `
        },
        {
            title: "Learning Style",
            content: `
                <div class="input-group">
                    <label for="learning_style">Preferred style</label>
                    <select id="learning_style" required>
                        <option value="" disabled selected>Select style</option>
                        <option value="Visual">Visual (videos, diagrams)</option>
                        <option value="Auditory">Auditory (podcasts, discussions)</option>
                        <option value="Kinesthetic">Kinesthetic (hands‑on, quizzes)</option>
                        <option value="Reading/Writing">Reading/Writing</option>
                    </select>
                </div>
            `
        }
    ];

    const stepContainer = document.getElementById('step-container');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const indicator = document.getElementById('step-indicator');

    let current = 0;

    function renderStep(index) {
        stepContainer.innerHTML = `
            <div class="step active">
                <h2 class="gradient-text">${steps[index].title}</h2>
                ${steps[index].content}
            </div>
        `;

        btnPrev.disabled = index === 0;
        btnNext.textContent = (index === steps.length - 1) ? 'Finish' : 'Next';

        indicator.innerHTML = steps.map((_, i) => `
            <div class="dot ${i === index ? 'active' : ''}"></div>
        `).join('');
    }

    function saveCurrentStep() {
        const inputs = stepContainer.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.id) {
                localStorage.setItem(`onboard_${input.id}`, input.value);
            }
        });
    }

    function loadSavedData() {
        const inputs = stepContainer.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.id) {
                const saved = localStorage.getItem(`onboard_${input.id}`);
                if (saved !== null) input.value = saved;
            }
        });
    }

    btnNext.addEventListener('click', () => {
        const required = stepContainer.querySelectorAll('[required]');
        for (const el of required) {
            if (!el.value.trim()) {
                el.focus();
                return;
            }
        }

        saveCurrentStep();

        if (current < steps.length - 1) {
            current++;
            renderStep(current);
            loadSavedData();
        } else {
            // Compile payload target values
            const profile = {
                name: localStorage.getItem('onboard_student_name') || '',
                goal: localStorage.getItem('onboard_goal') || '',
                skillLevel: localStorage.getItem('onboard_skill_level') || '',
                studyTime: localStorage.getItem('onboard_study_time') || '',
                learningStyle: localStorage.getItem('onboard_learning_style') || ''
            };

            // Post to backend database prior to interface movement
            fetch('save_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Lock down long-term standard individual keys needed across system views
                    localStorage.setItem('student_id', data.student_id);
                    localStorage.setItem('student_name', profile.name);
                    localStorage.setItem('goal', profile.goal);
                    localStorage.setItem('skill_level', profile.skillLevel);
                    localStorage.setItem('study_time', profile.studyTime);
                    localStorage.setItem('learning_style', profile.learningStyle);

                    // Purge temporary variables safely
                    Object.keys(localStorage).forEach(k => {
                        if (k.startsWith('onboard_')) localStorage.removeItem(k);
                    });

                    // Advance system to next milestone view
                    window.location.href = 'dashboard.html';
                } else {
                    alert("Onboarding sync failure: " + data.message);
                }
            })
            .catch(err => {
                console.error("Communication error saving profile data:", err);
                alert("An error occurred while saving your profile. Please try again.");
            });
        }
    });

    btnPrev.addEventListener('click', () => {
        if (current > 0) {
            current--;
            renderStep(current);
            loadSavedData();
        }
    });

    renderStep(current);
});