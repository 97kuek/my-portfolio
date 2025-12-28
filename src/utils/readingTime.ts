export function getReadingTime(text: string): string {
    if (!text) return "1 min read";
    const wordsPerMinute = 500; // Japanese/English mix estimation
    const words = text.length; // Simple character count for Japanese context
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}
