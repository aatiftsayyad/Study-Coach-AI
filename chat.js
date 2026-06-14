const chat = document.getElementById("chatMessages");

function getProfile() {
    try {
        return JSON.parse(localStorage.getItem("student_profile")) || {};
    } catch (e) {
        return {};
    }
}

function getStudentName() {
    const profile = getProfile();

    return (
        profile.student_name ||
        localStorage.getItem("student_name") ||
        localStorage.getItem("name") ||
        "Student"
    );
}

function getStudentGoal() {
    const profile = getProfile();

    return (
        profile.goal ||
        localStorage.getItem("goal") ||
        "General Learning"
    );
}

document.getElementById("studentName").innerText =
    getStudentName();

document.getElementById("studentGoal").innerText =
    getStudentGoal();

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function addUserMessage(text) {

    chat.innerHTML += `
    <div class="user-message">
        <div class="bubble">${escapeHtml(text)}</div>
    </div>`;

    chat.scrollTop = chat.scrollHeight;
}

function addAIMessage(text) {

    chat.innerHTML += `
    <div class="ai-message">
        <div class="avatar">🤖</div>
        <div class="bubble">
            ${String(text).replace(/\n/g,"<br>")}
        </div>
    </div>`;

    chat.scrollTop = chat.scrollHeight;
}

function showTyping() {

    chat.innerHTML += `
    <div id="typing" class="ai-message">
        <div class="avatar">🤖</div>
        <div class="bubble">Thinking...</div>
    </div>`;

    chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {

    const typing =
        document.getElementById("typing");

    if (typing) typing.remove();
}

function saveChat(role, message) {

    let history = [];

    try {
        history =
            JSON.parse(
                localStorage.getItem("chat_history")
            ) || [];
    } catch(e){}

    history.push({
        role,
        message,
        time: Date.now()
    });

    localStorage.setItem(
        "chat_history",
        JSON.stringify(history)
    );
}

async function sendMessage() {

    const input =
        document.getElementById("messageInput");

    const text =
        input.value.trim();

    if (!text) return;

    addUserMessage(text);

    saveChat("user", text);

    input.value = "";

    showTyping();

    const profile = getProfile();

    const payload = {

        message: text,

        name:
            profile.student_name ||
            localStorage.getItem("student_name") ||
            localStorage.getItem("name") ||
            "Student",

        goal:
            profile.goal ||
            localStorage.getItem("goal") ||
            "General Learning",

        skill_level:
            profile.skill_level ||
            localStorage.getItem("skill_level") ||
            "Beginner",

        learning_style:
            profile.learning_style ||
            localStorage.getItem("learning_style") ||
            "Visual",

        strong_topics:
            profile.strong_topics || [],

        weak_topics:
            profile.weak_topics || [],

        todays_mission:
            profile.todays_mission ||
            localStorage.getItem("todays_mission") ||
            "",

        stage:
            profile.weak_topics?.[0] ||
            localStorage.getItem("current_stage") ||
            "Foundations",

        progress:
            profile.progress_percentage || 0,

        streak:
            profile.study_streak ||
            localStorage.getItem("study_streak") ||
            1,

        score:
            profile.average_score ||
            localStorage.getItem("average_score") ||
            0,

        chat_history:
            JSON.parse(
                localStorage.getItem("chat_history")
                || "[]"
            )
    };

    console.log("PROFILE", profile);
    console.log("PAYLOAD", payload);

    try {

        const response =
            await fetch(
                "send_message.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body:
                    JSON.stringify(payload)
                }
            );

        const data =
            await response.json();

        removeTyping();

        console.log("FOUNDRY", data);

        if (data.success) {

            addAIMessage(data.message);

            saveChat(
                "assistant",
                data.message
            );

        } else {

            addAIMessage(
                "⚠️ " + data.message
            );
        }

    } catch(error) {

        removeTyping();

        addAIMessage(
            "⚠️ Failed to connect to Foundry Agent."
        );

        console.error(error);
    }
}

function sendSuggestion(btn) {

    document.getElementById(
        "messageInput"
    ).value = btn.innerText;

    sendMessage();
}

document
.getElementById("messageInput")
.addEventListener(
    "keydown",
    function(e){

        if(e.key === "Enter"){

            e.preventDefault();

            sendMessage();
        }
    }
);