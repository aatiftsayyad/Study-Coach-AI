// LOAD STUDENT DATA - Initial rendering placeholder states
const name = localStorage.getItem("student_name");
const goal = localStorage.getItem("goal");

if (name) {
    document.getElementById("studentName").innerHTML = `Welcome Back, ${name} 👋`;
}

if (goal) {
    document.getElementById("goalText").innerHTML = goal;
}

// FETCH AND POPULATE UPPER DASHBOARD DECK
function loadTopDashboardData(studentId) {
    fetch(`get_top_dashboard.php?student_id=${studentId}`)
        .then(response => response.json())
        .then(res => {
            if (!res.success) {
                console.error(res.message);
                return;
            }

            const data = res.data;

            // CRITICAL SYNC GAP FIX: Update localStorage fields dynamically with real db data 
            // This ensures chat.js reads exactly what is calculated inside your database metrics!
            localStorage.setItem("student_name", data.name || "Student");
            localStorage.setItem("goal", data.goal_title || "General Learning");
            localStorage.setItem("current_stage", data.current_stage || "Getting Started Foundations");
            localStorage.setItem("progress_percentage", (data.progress_percentage || 0) + "%");
            localStorage.setItem("study_streak", data.study_streak || "0");
            localStorage.setItem("average_score", (data.average_score || 0) + "%");

            document.getElementById("err").innerText = JSON.stringify(data, null, 2);

            // 1. Welcome Greeting Text
            document.getElementById("studentName").innerHTML = `Welcome Back, ${data.name} 👋`;

            // 2. Update Streak Element 
            document.getElementById("study-streak").textContent = data.study_streak + " Days";

            // 3. Current Goal Title Box
            document.getElementById("goalText").textContent = data.goal_title || "No Active Goal";

            // 4. Circular Progress Metric Ring Update
            const progressValue = data.progress_percentage || 0;
            const progressSpan = document.querySelector(".progress-ring span");
            const progressCircle = document.querySelector(".progress-circle");
            
            if (progressSpan) progressSpan.textContent = `${progressValue}%`;
            if (progressCircle) {
                const maxDash = 283;
                const offset = maxDash - ((maxDash * progressValue) / 100);
                progressCircle.style.strokeDashoffset = offset;
            }

            // 5. Numerical Metrics Cards (Streak & Average Score)
            const cardsContainer = document.querySelectorAll(".cards .card h2");
            if (cardsContainer.length >= 4) {
                cardsContainer[2].innerHTML = `${data.study_streak || 0} Days 🔥`;
                cardsContainer[3].innerHTML = `${data.average_score || 0}%`;
            }
        })
        .catch(err => {
            if (document.getElementById("err")) document.getElementById("err").innerHTML = "";
            console.error("Failed to parse dashboard dataset:", err);
        });
}

// DYNAMIC LOOKUP FIX: Automatically boot dashboard utilizing correct onboarding ID pointer
const targetStudentId = localStorage.getItem("student_id");
if (targetStudentId) {
    loadTopDashboardData(targetStudentId);
} else {
    console.warn("No baseline user context present. Redirecting back to startup profile wizard.");
    window.location.href = "welcome.html"; 
}

// PROGRESS CHART
const progressCtx = document.getElementById("progressChart");
new Chart(progressCtx,{
    type:'line',
    data:{
        labels:['Week 1','Week 2','Week 3','Week 4','Week 5'],
        datasets:[{
            label:'Learning Progress',
            data:[10,25,40,55,65],
            borderColor:'#3B82F6',
            backgroundColor:'rgba(59,130,246,.2)',
            fill:true,
            tension:.4
        }]
    },
    options:{
        plugins:{ legend:{ labels:{ color:'#F8FAFC' } } },
        scales:{
            x:{ ticks:{ color:'#F8FAFC' } },
            y:{ ticks:{ color:'#F8FAFC' } }
        }
    }
});

// TOPIC MASTERY
const topicCtx = document.getElementById("topicChart");
new Chart(topicCtx,{
    type:'radar',
    data:{
        labels:['AI','Python','Prompt Eng','ML','Neural Nets'],
        datasets:[{
            label:'Mastery',
            data:[90,85,95,60,40],
            borderColor:'#8B5CF6',
            backgroundColor:'rgba(139,92,246,.2)'
        }]
    },
    options:{
        plugins:{ legend:{ labels:{ color:'#F8FAFC' } } },
        scales:{
            r:{
                angleLines:{ color:'rgba(255,255,255,.2)' },
                grid:{ color:'rgba(255,255,255,.15)' },
                pointLabels:{ color:'#F8FAFC' },
                ticks:{ display:false }
            }
        }
    }
});

// CARD ANIMATION
const cards = document.querySelectorAll('.card');
cards.forEach((card,index)=>{
    card.style.opacity="0";
    card.style.transform="translateY(30px)";
    setTimeout(()=>{
        card.style.transition=".6s";
        card.style.opacity="1";
        card.style.transform="translateY(0)";
    },index*100);
});

const particleContainer = document.getElementById('particles');
if (particleContainer) {
    for(let i=0;i<25;i++){
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random()*100+'vw';
        p.style.animationDuration = (5+Math.random()*10)+'s';
        p.style.animationDelay = Math.random()*5+'s';
        particleContainer.appendChild(p);
    }
}

// ...................... daily mission setup ...................................................
function getTodayDateString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function setCookie(name, value, days = 1) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Strict`;
}

function handleDailyMissionPipeline() {
    const todayDate = getTodayDateString();
    const missionCookieRaw = getCookie("todays_mission_data");
    const missionContainer = document.querySelector(".welcome-card p");

    if (missionCookieRaw) {
        try {
            const parsedCookie = JSON.parse(decodeURIComponent(missionCookieRaw));
            if (parsedCookie.date === todayDate) {
                if (missionContainer) missionContainer.textContent = parsedCookie.mission;
                console.log("Mission loaded seamlessly from browser cookie cache.");
                return;
            }
        } catch (e) {
            console.error("Cookie parsing failed, fetching new mission from backend instead.", e);
        }
    }

    console.log("No mission active for today's date. Requesting generation from PHP...");
    const studentName = localStorage.getItem("student_name") || "Student";
    const currentGoal = localStorage.getItem("goal") || "Learn Generative AI";

    fetch(`get_ai_mission.php?name=${encodeURIComponent(studentName)}&goal=${encodeURIComponent(currentGoal)}`)
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                if (missionContainer) missionContainer.textContent = res.mission;
                const cookiePayload = { date: todayDate, mission: res.mission };
                setCookie("todays_mission_data", JSON.stringify(cookiePayload), 2);
                console.log("Cached newly generated mission into cookies for date: " + todayDate);
            } else {
                throw new Error(res.message);
            }
        })
        .catch(err => {
            console.error("Pipeline Error:", err);
            if (missionContainer) {
                missionContainer.textContent = `Keep pushing forward on your goal: "${currentGoal}". Review today's topics and hit your daily targets!`;
            }
        });
}

handleDailyMissionPipeline();
// ..................................... daily mission setup ends ....................................................