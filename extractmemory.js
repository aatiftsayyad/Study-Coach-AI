const API_KEY = "AQ.Ab8RN6K19IaNwcpsFla6S4yv11zttEwtNxGRmuXd7Yk_JA5ztw";

const URL =
`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;

async function analyzeMemory(
    currentMemory,
    studentQuestion,
    agentResponse
)
{
    const prompt = `

You are a memory extraction engine.

Current Student Memory:

${JSON.stringify(currentMemory,null,2)}

Student Question:

${studentQuestion}

AI Study Coach Response:

${agentResponse}

Analyze the conversation.

Update student memory.

Return ONLY valid JSON.

{
    "goal":"",
    "skill_level":"",
    "weak_topics":[],
    "strong_topics":[],
    "learning_style":"",
    "interests":[]
}

Do not return markdown.
Do not return explanations.
Return JSON only.

`;

    const res = await fetch(URL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            contents:[
                {
                    parts:[
                        {
                            text:prompt
                        }
                    ]
                }
            ]
        })
    });

    const data =
    await res.json();

    if(!data.candidates)
    {
        throw new Error(
            "Gemini API failed"
        );
    }

    const text =
    data.candidates[0]
    .content.parts[0]
    .text;

    try
    {
        return JSON.parse(
            text
            .replace(/```json/g,"")
            .replace(/```/g,"")
            .trim()
        );
    }
    catch(err)
    {
        console.error(
            "Invalid JSON returned",
            text
        );

        return null;
    }
}