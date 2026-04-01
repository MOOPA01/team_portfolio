// =============================================================
//  H.E.I.S.T.EXE NPC AI Chat System
// =============================================================

// ─── NPC RESPONSES (thematically relevant) ───────────────────
const NPC_PERSONALITY = {
  greetings: [
    "Protocol active. State your concerns, operative.",
    "Ghost Protocol engaged. I'm here to advise.",
    "Secure channel established. What's on your mind?"
  ],
  tips: [
    "Collect all data packages before extraction. They're essential.",
    "Guards patrol in predictable patterns. Study their routes.",
    "Stay in shadows when possible. Avoid direct confrontation.",
    "The extraction point activates once all packages are secured.",
    "Watch the guard movements—timing is everything."
  ],
  encouragement: [
    "You're doing well, operative. Stay focused.",
    "The mission is within reach. Keep moving.",
    "Excellent work. The extraction point awaits.",
    "Stay sharp. You've got this."
  ],
  warnings: [
    "Guards detected nearby. Proceed with caution.",
    "Time is critical. Focus on the objective.",
    "Don't get caught. The mission depends on you.",
    "Remember: collect all gems before approaching extraction."
  ],
  unknown: [
    "Unclear transmission. Rephrase your query.",
    "That's not in my tactical database.",
    "Focus on the mission, operative.",
    "Maintain operational security. Stick to essentials."
  ]
};

export class HeistNPC {
  constructor() {
    this.messageHistory = [];
    this.chatOpen = false;
  }

  generateResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    // Simple keyword matching for contextual responses
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      return this.getRandomResponse(NPC_PERSONALITY.greetings);
    }
    if (msg.includes('tip') || msg.includes('tip') || msg.includes('help') || msg.includes('advice')) {
      return this.getRandomResponse(NPC_PERSONALITY.tips);
    }
    if (msg.includes('good') || msg.includes('great') || msg.includes('thanks')) {
      return this.getRandomResponse(NPC_PERSONALITY.encouragement);
    }
    if (msg.includes('guard') || msg.includes('danger') || msg.includes('caught')) {
      return this.getRandomResponse(NPC_PERSONALITY.warnings);
    }
    // Default unknown response
    return this.getRandomResponse(NPC_PERSONALITY.unknown);
  }

  getRandomResponse(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  addMessage(sender, text) {
    this.messageHistory.push({ sender, text, timestamp: Date.now() });
  }

  getHistory() {
    return this.messageHistory;
  }

  reset() {
    this.messageHistory = [];
  }
}

export function initNPCSystem() {
  return new HeistNPC();
}