export const APP_NAME = "PolyDime";

export const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-email":           "That email address doesn't look right. Please check and try again.",
  "auth/user-not-found":          "No account found with this email. Would you like to sign up?",
  "auth/wrong-password":          "Incorrect password. Please try again or reset your password.",
  "auth/too-many-requests":       "Too many attempts. Please wait a moment before trying again.",
  "auth/email-already-in-use":    "An account with this email already exists. Try logging in instead.",
  "auth/network-request-failed":  "Connection issue. Please check your internet and try again.",
  "default":                      "Something went wrong. Please try again in a moment."
};

export const COURSES = [
  { id: 'btech', title: 'B.Tech', desc: '4-Year Degree Program', icon: '🎓' },
  { id: 'diploma', title: 'Diploma/Polytechnic', desc: '3-Year Program', icon: '📐' }
];

export const BRANCHES: Record<string, { id: string, name: string }[]> = {
  btech: [
    { id: 'cse', name: 'Computer Science' },
    { id: 'ece', name: 'Electronics & Communication' },
    { id: 'mech', name: 'Mechanical Engineering' },
    { id: 'civil', name: 'Civil Engineering' }
  ],
  diploma: [
    { id: 'cse', name: 'Computer Engineering' },
    { id: 'ece', name: 'Electronics & Communication' },
    { id: 'mech', name: 'Mechanical Engineering' },
    { id: 'civil', name: 'Civil Engineering' }
  ]
};

export const BOT_RESPONSES: Record<string, string> = {
  "material": "Go to the Materials tab and filter by subject or semester.",
  "pdf": "Go to the Materials tab and filter by subject or semester.",
  "notes": "Go to the Materials tab and filter by subject or semester.",
  "branch": "Visit your Profile → Settings to update your course or branch.",
  "course": "Visit your Profile → Settings to update your course or branch.",
  "change": "Visit your Profile → Settings to update your course or branch.",
  "login": "Use the Sign In button in the top-right corner.",
  "signup": "Use the Sign In button in the top-right corner.",
  "register": "Use the Sign In button in the top-right corner.",
  "help": "Click Help in the menu to restart the onboarding tour.",
  "tutorial": "Click Help in the menu to restart the onboarding tour.",
  "guide": "Click Help in the menu to restart the onboarding tour.",
  "default": "I'm not sure about that yet. Try browsing the Materials section or contact support."
};
