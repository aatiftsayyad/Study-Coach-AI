function getMemoryFromProfile() {
    try {
        const profile = JSON.parse(localStorage.getItem('student_profile') || 'null');
        if (!profile) return null;
        return profile.memory || {
            goal: profile.goal || '',
            skill_level: profile.skill_level || '',
            learning_style: profile.learning_style || '',
            interests: [],
            strong_topics: profile.strong_topics || [],
            weak_topics: profile.weak_topics || [],
            recent_topics: []
        };
    } catch {
        return null;
    }
}

function detectTopicMentions(text, profile) {
    const source = [
        ...(profile.strong_topics || []),
        ...(profile.weak_topics || []),
        profile.goal || '',
        profile.skill_level || ''
    ].join(' ').toLowerCase();

    const tokens = String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    const hits = [];
    tokens.forEach((token) => {
        if (token.length < 4) return;
        if (source.includes(token) && !hits.includes(token)) {
            hits.push(token);
        }
    });
    return hits;
}

function updateMemoryFromConversation(profile, userText, aiText) {
    const memory = profile.memory || {
        goal: profile.goal || '',
        skill_level: profile.skill_level || '',
        learning_style: profile.learning_style || '',
        interests: [],
        strong_topics: profile.strong_topics || [],
        weak_topics: profile.weak_topics || [],
        recent_topics: []
    };

    const lowerUser = String(userText || '').toLowerCase();
    const lowerAi = String(aiText || '').toLowerCase();
    const mentions = detectTopicMentions(userText, profile);

    if (mentions.length) {
        memory.recent_topics = [...mentions.slice(-4), ...(memory.recent_topics || [])].slice(0, 8);
    }

    if (/like|enjoy|love|interested|prefer/.test(lowerUser)) {
        const words = String(userText || '')
            .replace(/[^a-z0-9\s]/gi, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 3);
        words.slice(0, 4).forEach((word) => {
            if (!memory.interests.includes(word)) memory.interests.push(word);
        });
    }

    if (/confused|stuck|hard|difficult|weak|forget|struggling/.test(lowerUser)) {
        mentions.forEach((topic) => {
            if (!memory.weak_topics.includes(topic)) memory.weak_topics.unshift(topic);
        });
    }

    if (/got it|understand|easy|clear|nice|good|solved/.test(lowerUser)) {
        mentions.forEach((topic) => {
            if (!memory.strong_topics.includes(topic)) memory.strong_topics.unshift(topic);
        });
    }

    const positiveAi = /(great|nice|excellent|strong|good progress|keep going|well done)/.test(lowerAi);
    if (positiveAi && mentions.length) {
        mentions.forEach((topic) => {
            if (!memory.strong_topics.includes(topic)) memory.strong_topics.unshift(topic);
        });
    }

    memory.strong_topics = [...new Set((memory.strong_topics || []).filter(Boolean))].slice(0, 10);
    memory.weak_topics = [...new Set((memory.weak_topics || []).filter(Boolean))].slice(0, 10);
    memory.interests = [...new Set((memory.interests || []).filter(Boolean))].slice(0, 10);

    return memory;
}
