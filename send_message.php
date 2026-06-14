<?php
session_start();
header("Content-Type: application/json");
require_once("config.php");

/**
 * Fetches an OAuth 2.0 Access Token from Microsoft Entra ID
 */
function getAccessToken()
{
    $url = "https://login.microsoftonline.com/" . TENANT_ID . "/oauth2/v2.0/token";

    $postData = http_build_query([
        "client_id"     => CLIENT_ID,
        "client_secret" => CLIENT_SECRET,
        "scope"          => "https://ai.azure.com/.default",
        "grant_type"    => "client_credentials"
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postData,
        CURLOPT_HTTPHEADER     => [
            "Content-Type: application/x-www-form-urlencoded"
        ]
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    if (!isset($data["access_token"])) {
        throw new Exception("Failed to obtain access token from Entra ID. Response: " . $response);
    }

    return $data["access_token"];
}

try {
    $accessToken = getAccessToken();

    // Decode rich JSON structure arriving from front-end
    $input = json_decode(file_get_contents("php://input"), true);
    $message = trim($input["message"] ?? "");

    // Extract complete context coordinates passed from JavaScript local storage
    $stName     = $input["name"] ?? "Student";
    $stGoal     = $input["goal"] ?? "General Academic Development";
    $stStage    = $input["stage"] ?? "Core Fundamentals";
    $stProgress = $input["progress"] ?? "0%";
    $stStreak   = $input["streak"] ?? "0";
    $stScore    = $input["score"] ?? "Unranked";
    $stSkillLevel =
    $input["skill_level"] ?? "Beginner";

    $stLearningStyle =
    $input["learning_style"] ?? "Visual";

    $stStrongTopics =
    implode(
    ", ",
    $input["strong_topics"] ?? []
    );

    $stWeakTopics =
    implode(
    ", ",
    $input["weak_topics"] ?? []
    );

    $stMission =
    $input["todays_mission"] ?? "";


    if (empty($message)) {
        echo json_encode([
            "success" => false,
            "message" => "Message is empty"
        ]);
        exit;
    }

    $threadId = $_SESSION["thread_id"] ?? "";

    /*
    -----------------------------------
    1. CREATE THREAD & INJECT CORE MEMORY (IF NOT EXISTS)
    -----------------------------------
    */
    if (empty($threadId)) {
        $url = FOUNDRY_ENDPOINT . "/api/projects/" . PROJECT_NAME . "/threads?api-version=v1";

        // Enhanced, highly focused structural directive prompt
       $systemInstructions = "

You are Study Coach AI.

Student Profile:

Name:
$stName

Goal:
$stGoal

Skill Level:
$stSkillLevel

Learning Style:
$stLearningStyle

Current Stage:
$stStage

Progress:
$stProgress

Study Streak:
$stStreak

Average Score:
$stScore

Strong Topics:
$stStrongTopics

Weak Topics:
$stWeakTopics

Today's Mission:
$stMission

Instructions:

1. Personalize every answer.
2. Use weak topics when creating plans.
3. Use strong topics when creating challenges.
4. Adapt explanations to learning style.
5. Never give generic study advice.
6. If asked for roadmap:

   * Weekly plan
   * Daily plan
   * Milestones
   * Resources
   * Projects
7. If asked what to study:
   prioritize weak topics.
8. Give detailed answers.
9. Use markdown formatting.
10. Act like a premium AI tutor.
11. Give response in plain text and don't give any table or anythinh. Only Plain Text.

";


        // Pre-seed Thread Context Message #0
        $threadPayload = [
            "messages" => [
                [
                    "role" => "user",
                    "content" => $systemInstructions
                ]
            ]
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer " . $accessToken,
                "Content-Type: application/json"
            ],
            CURLOPT_POSTFIELDS     => json_encode($threadPayload)
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $thread = json_decode($response, true);

        if (!isset($thread["id"])) {
            throw new Exception("Thread creation failed: " . $response);
        }

        $threadId = $thread["id"];
        $_SESSION["thread_id"] = $threadId;
    }

    /*
    -----------------------------------
    2. ADD THE USER'S ACTUAL CONVERSATION QUESTION
    -----------------------------------
    */
    $url = FOUNDRY_ENDPOINT . "/api/projects/" . PROJECT_NAME . "/threads/" . $threadId . "/messages?api-version=v1";
    $payload = [
        "role"    => "user",
        "content" => $message
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer " . $accessToken,
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS     => json_encode($payload)
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    /*
    -----------------------------------
    3. RUN AGENT
    -----------------------------------
    */
    $url = FOUNDRY_ENDPOINT . "/api/projects/" . PROJECT_NAME . "/threads/" . $threadId . "/runs?api-version=v1";
    $payload = [
        "assistant_id" => AGENT_ID
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer " . $accessToken,
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS     => json_encode($payload)
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $run = json_decode($response, true);

    if (!isset($run["id"])) {
        throw new Exception("Failed to start agent run: " . $response);
    }

    $runId = $run["id"];

    /*
    -----------------------------------
    4. WAIT FOR COMPLETION
    -----------------------------------
    */
    $status = "";
    $maxAttempts = 30;
    $attempt = 0;

    while ($status !== "completed" && $attempt < $maxAttempts) {
        sleep(1);

        $url = FOUNDRY_ENDPOINT . "/api/projects/" . PROJECT_NAME . "/threads/" . $threadId . "/runs/" . $runId . "?api-version=v1";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer " . $accessToken
            ]
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        $runData = json_decode($response, true);
        $status = $runData["status"] ?? "";

        if (in_array($status, ["failed", "cancelled", "expired"])) {
            throw new Exception("Agent run failed with status: " . $status . ". Response: " . $response);
        }

        $attempt++;
    }

    /*
    -----------------------------------
    5. GET MESSAGES
    -----------------------------------
    */
    $url = FOUNDRY_ENDPOINT . "/api/projects/" . PROJECT_NAME . "/threads/" . $threadId . "/messages?api-version=v1";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer " . $accessToken
        ]
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);
    $reply = "No response received.";

    if (isset($data["data"])) {
        foreach ($data["data"] as $msg) {
            if ($msg["role"] === "assistant") {
                $reply = $msg["content"][0]["text"]["value"] ?? $reply;
                break;
            }
        }
    }

    echo json_encode([
        "success" => true,
        "message" => $reply
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>