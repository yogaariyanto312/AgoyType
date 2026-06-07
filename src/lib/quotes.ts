/** Built-in quotes used for quote mode (also seeded into the `Quote` table). */

export interface QuoteData {
  text: string;
  source: string;
  length: "short" | "medium" | "long";
  /** Language of the quote (defaults to English when omitted). */
  language?: string;
}

export const QUOTES: QuoteData[] = [
  {
    text: "The only way to do great work is to love what you do.",
    source: "Steve Jobs",
    length: "short",
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    source: "Leonardo da Vinci",
    length: "short",
  },
  {
    text: "The journey of a thousand miles begins with a single step.",
    source: "Lao Tzu",
    length: "short",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop moving forward.",
    source: "Confucius",
    length: "short",
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute. A program is like a poem: you cannot write a poem without writing it.",
    source: "Harold Abelson",
    length: "medium",
  },
  {
    text: "The computer was born to solve problems that did not exist before. Today we have machines that think, and people who do not, which is a curious reversal of the natural order of things.",
    source: "Bill Gates",
    length: "medium",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts. The pessimist sees difficulty in every opportunity; the optimist sees the opportunity in every difficulty.",
    source: "Winston Churchill",
    length: "medium",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit. The roots of education are bitter, but the fruit is sweet, and the more we practice the more the difficult becomes routine and the routine becomes effortless and natural.",
    source: "Aristotle",
    length: "long",
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. The function of good software is to make the complex appear to be simple, and the best engineers spend their careers learning how to remove, not add, until nothing is left to take away.",
    source: "Martin Fowler",
    length: "long",
  },
  {
    text: "In three words I can sum up everything I have learned about life: it goes on. The future belongs to those who believe in the beauty of their dreams, and the only limit to our realization of tomorrow will be our doubts of today, so let us move forward with strong and active faith.",
    source: "Robert Frost & F. D. Roosevelt",
    length: "long",
  },

  // --- Indonesian -----------------------------------------------------------
  {
    text: "Di mana ada kemauan, di situ ada jalan.",
    source: "Peribahasa",
    length: "short",
    language: "indonesian",
  },
  {
    text: "Sedikit demi sedikit, lama-lama menjadi bukit.",
    source: "Peribahasa",
    length: "short",
    language: "indonesian",
  },
  {
    text: "Tak ada gading yang tak retak.",
    source: "Peribahasa",
    length: "short",
    language: "indonesian",
  },
  {
    text: "Berakit-rakit ke hulu, berenang-renang ke tepian. Bersakit-sakit dahulu, bersenang-senang kemudian.",
    source: "Peribahasa",
    length: "medium",
    language: "indonesian",
  },
  {
    text: "Buku adalah jendela dunia, dan dengan membaca setiap hari kita perlahan membuka cakrawala pengetahuan yang begitu luas dan tidak pernah ada habisnya.",
    source: "Pepatah",
    length: "medium",
    language: "indonesian",
  },
  {
    text: "Pendidikan adalah senjata paling ampuh yang dapat kamu gunakan untuk mengubah dunia, karena dengan ilmu yang bermanfaat seseorang mampu memperbaiki dirinya sendiri terlebih dahulu dan kemudian memberi manfaat yang nyata bagi orang banyak di sekitarnya.",
    source: "Pepatah",
    length: "long",
    language: "indonesian",
  },
];

export function pickQuote(
  length?: "short" | "medium" | "long",
  language = "english",
): QuoteData {
  const byLanguage = QUOTES.filter(
    (q) => (q.language ?? "english") === language,
  );
  const base = byLanguage.length > 0 ? byLanguage : QUOTES;
  const pool = length ? base.filter((q) => q.length === length) : base;
  const list = pool.length > 0 ? pool : base;
  return list[Math.floor(Math.random() * list.length)];
}
