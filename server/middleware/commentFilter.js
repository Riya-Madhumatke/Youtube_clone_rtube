const abusiveWords = [
  "idiot",
  "stupid",
  "moron",
  "bastard",
  "damn",
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

  return {
    valid: true,
  };
};