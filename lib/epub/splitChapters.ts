// Utility to split long chapters into smaller chunks if needed

export interface ChapterChunk {
  index: number
  content: string
  wordCount: number
}

const MAX_WORDS_PER_CHUNK = 5000

export function splitChapter(content: string): ChapterChunk[] {
  const words = content.split(/\s+/)

  if (words.length <= MAX_WORDS_PER_CHUNK) {
    return [
      {
        index: 0,
        content,
        wordCount: words.length,
      },
    ]
  }

  const chunks: ChapterChunk[] = []
  let currentChunk: string[] = []
  let currentWordCount = 0

  for (const word of words) {
    currentChunk.push(word)
    currentWordCount++

    if (currentWordCount >= MAX_WORDS_PER_CHUNK) {
      chunks.push({
        index: chunks.length,
        content: currentChunk.join(" "),
        wordCount: currentWordCount,
      })
      currentChunk = []
      currentWordCount = 0
    }
  }

  // Add remaining words
  if (currentChunk.length > 0) {
    chunks.push({
      index: chunks.length,
      content: currentChunk.join(" "),
      wordCount: currentWordCount,
    })
  }

  return chunks
}

export function estimateReadingTime(wordCount: number, wordsPerMinute = 200): number {
  return Math.ceil(wordCount / wordsPerMinute)
}
