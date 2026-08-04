const abusiveWords = [
  "idiot",
  "stupid",
  "moron",
  "dumb",
  "loser",
  "fool",
  "hate",
  "bastard",
  "fuck",
  "rape",
  "suicide",
  "shit",
  "asshole",
];

const spamPatterns = [
  /subscribe/i,
  /follow me/i,
  /visit my/i,
  /click here/i,
  /http[s]?:\/\//i,
  /www\./i,
  /\.com/i,
  /\.net/i,
];

export const validateComment = (comment) => {
  if (!comment || !comment.trim()) {
    return {
      valid: false,
      message: "Comment cannot be empty.",
    };
  }

  const text = comment.trim();

  // Block abusive words
  const lowerText = text.toLowerCase();

  for (const word of abusiveWords) {
    if (lowerText.includes(word)) {
      return {
        valid: false,
        message: "Comment contains inappropriate language.",
      };
    }
  }

  // Block spam
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return {
        valid: false,
        message: "Spam comments are not allowed.",
      };
    }
  }

  // Block comments made only of repeated special characters
  if (/^([!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])\1{4,}$/.test(text)) {
    return {
      valid: false,
      message: "Invalid comment.",
    };
  }

  // Block repeated same character (e.g. aaaaaaaaaaaa)
  if (/^(.)\1{7,}$/.test(text)) {
    return {
      valid: false,
      message: "Please enter a meaningful comment.",
    };
  }

  // Detect repeated words (spam)
const words = lowerText.split(/\s+/);
const frequency = {};

for (const word of words) {
  frequency[word] = (frequency[word] || 0) + 1;

  if (frequency[word] >= 5) {
    return {
      valid: false,
      message: "Spam comment detected.",
    };
  }
}

  return {
    valid: true,
  };
};