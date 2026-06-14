const chat = document.getElementById("chatMessages");

// Load top header fields from local storage safely
const name = localStorage.getItem("student_name");
const goal = localStorage.getItem("goal");

if (name) document.getElementById("studentName").innerHTML = name;
if (goal) document.getElementById("studentGoal").innerHTML = goal;

function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (text === "") return;

    // Render user message to UI immediately
    addUserMessage(text);
    input.value = "";
    showTyping();

    setTimeout(() => {
        // Collect ALL real-time metric strings from browser local storage to pass to backend
        const studentPayload = {
            message: text,
            name: localStorage.getItem("student_name") || "Student",
            goal: localStorage.getItem("goal") || "General Learning",
            stage: localStorage.getItem("current_stage") || "Getting Started Foundations",
            progress: localStorage.getItem("progress_percentage") || "0%",
            streak: localStorage.getItem("study_streak") || "0",
            score: localStorage.getItem("average_score") || "Not Assessed Yet"
        };

        fetch("send_message.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentPayload) // Sends user message along with complete student profile
        })
        .then(res => res.json())
        .then(data => {
            removeTyping();
            if (data.success) {
                addAIMessage(data.message);
            } else {
                addAIMessage("⚠️ Error: " + data.message);
            }
        })
        .catch(err => {
            removeTyping();
            addAIMessage("⚠️ Front-end communication error occurred.");
            console.error(err);
        });

    }, 1500);
}

function addUserMessage(text) {
    chat.innerHTML += `
    <div class="user-message">
        <div class="bubble">${text}</div>
    </div>`;
    chat.scrollTop = chat.scrollHeight;
}

function addAIMessage(text) {
    chat.innerHTML += `
    <div class="ai-message">
        <div class="avatar">🤖</div>
        <div class="bubble">${text}</div>
    </div>`;
    chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
    chat.innerHTML += `
    <div id="typing" class="ai-message">
        <div class="avatar">🤖</div>
        <div class="bubble">Typing...</div>
    </div>`;
    chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

function sendSuggestion(btn) {
    document.getElementById("messageInput").value = btn.innerText;
    sendMessage();
}