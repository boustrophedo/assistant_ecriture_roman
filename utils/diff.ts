export type DiffPart = {
    value: string;
    type: 'common' | 'added' | 'removed';
};

/**
 * Generates a word-level diff between two strings using the Longest Common Subsequence algorithm.
 * @param originalText The original string.
 * @param userText The new string to compare.
 * @returns An object with two arrays of DiffPart, one for original and one for user text.
 */
export function generateDiff(originalText: string, userText: string): { originalResult: DiffPart[], userResult: DiffPart[] } {
    const splitRegex = /(\s+|[.,;!?"])/;
    const originalWords = originalText.split(splitRegex).filter(w => w);
    const userWords = userText.split(splitRegex).filter(w => w);

    const dp = Array(originalWords.length + 1).fill(null).map(() => Array(userWords.length + 1).fill(0));

    for (let i = 1; i <= originalWords.length; i++) {
        for (let j = 1; j <= userWords.length; j++) {
            if (originalWords[i - 1] === userWords[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const originalResult: DiffPart[] = [];
    const userResult: DiffPart[] = [];
    let i = originalWords.length;
    let j = userWords.length;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && originalWords[i - 1] === userWords[j - 1]) {
            originalResult.unshift({ value: originalWords[i - 1], type: 'common' });
            userResult.unshift({ value: userWords[j - 1], type: 'common' });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            userResult.unshift({ value: userWords[j - 1], type: 'added' });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            originalResult.unshift({ value: originalWords[i - 1], type: 'removed' });
            i--;
        } else {
            break;
        }
    }
  
    return { originalResult, userResult };
}
