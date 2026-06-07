/**
 * Built-in word lists and the test-text generator.
 *
 * These lists ship with the app so the typing test works with zero database
 * setup; the same lists are seeded into the `WordList` table for admin editing.
 */

import { mulberry32, shuffle } from "./utils";

export const ENGLISH_200: string[] = [
  "the","of","to","and","a","in","is","it","you","that","he","was","for","on",
  "are","with","as","I","his","they","be","at","one","have","this","from","or",
  "had","by","not","word","but","what","some","we","can","out","other","were",
  "all","there","when","up","use","your","how","said","an","each","she","which",
  "do","their","time","if","will","way","about","many","then","them","write",
  "would","like","so","these","her","long","make","thing","see","him","two",
  "has","look","more","day","could","go","come","did","number","sound","no",
  "most","people","my","over","know","water","than","call","first","who","may",
  "down","side","been","now","find","any","new","work","part","take","get",
  "place","made","live","where","after","back","little","only","round","man",
  "year","came","show","every","good","me","give","our","under","name","very",
  "through","just","form","sentence","great","think","say","help","low","line",
  "differ","turn","cause","much","mean","before","move","right","boy","old",
  "too","same","tell","does","set","three","want","air","well","also","play",
  "small","end","put","home","read","hand","port","large","spell","add","even",
  "land","here","must","big","high","such","follow","act","why","ask","men",
  "change","went","light","kind","off","need","house","picture","try","us",
  "again","animal","point","mother","world","near","build","self","earth",
  "father","head","stand","own","page","should","country","found","answer",
  "school","grow","study","still","learn","plant","cover","food","sun","four",
  "between","state","keep","eye","never","last","let","thought","city","tree",
];

export const COMMON_500_EXTRA: string[] = [
  "across","against","behind","beyond","despite","during","except","inside",
  "outside","throughout","toward","underneath","within","without","although",
  "because","however","therefore","meanwhile","otherwise","nevertheless",
  "consequently","furthermore","moreover","accordingly","whenever","wherever",
  "whatever","whichever","whoever","computer","keyboard","language","practice",
  "develop","function","variable","constant","operator","integer","boolean",
  "interface","abstract","concrete","instance","property","attribute","method",
  "argument","parameter","recursion","iteration","algorithm","structure",
  "pointer","reference","allocate","compile","execute","runtime","syntax",
  "semantic","feature","release","version","quality","velocity","momentum",
  "gravity","distance","journey","horizon","mountain","valley","river","ocean",
  "desert","forest","island","weather","climate","season","morning","evening",
  "twilight","midnight","sunrise","sunset","shadow","silence","whisper","melody",
  "rhythm","harmony","balance","courage","wisdom","patience","kindness","honest",
  "loyal","gentle","curious","creative","fearless","graceful","radiant",
];

// ---------------------------------------------------------------------------
// Indonesian
// ---------------------------------------------------------------------------

export const INDONESIAN_200: string[] = [
  "yang","dan","di","itu","dengan","untuk","tidak","ini","dari","dalam",
  "akan","pada","juga","saya","ke","karena","bisa","ada","mereka","lebih",
  "kata","sudah","atau","hingga","kepada","oleh","saat","harus","sebagai","masih",
  "hal","ketika","bahwa","dapat","kami","kita","anda","dia","kamu","orang",
  "satu","dua","tiga","empat","lima","banyak","semua","tahun","hari","waktu",
  "tempat","dunia","negara","kota","rumah","jalan","air","api","tanah","langit",
  "laut","gunung","sungai","pohon","bunga","hewan","makan","minum","tidur","kerja",
  "main","baca","tulis","lihat","dengar","bicara","lari","duduk","berdiri","datang",
  "pergi","pulang","masuk","keluar","buka","tutup","ambil","beri","buat","pakai",
  "cari","temu","tanya","jawab","mulai","henti","coba","mau","suka","cinta",
  "sayang","senang","sedih","marah","takut","berani","baik","buruk","besar","kecil",
  "panjang","pendek","tinggi","rendah","cepat","lambat","kuat","lemah","baru","lama",
  "muda","tua","kaya","miskin","mudah","sulit","benar","salah","bersih","kotor",
  "terang","gelap","panas","dingin","sedikit","penuh","kosong","jauh","dekat","depan",
  "belakang","atas","bawah","kanan","kiri","luar","sekarang","nanti","kemarin","besok",
  "pagi","siang","sore","malam","minggu","bulan","putih","hitam","merah","biru",
  "hijau","kuning","kepala","tangan","kaki","mata","telinga","hidung","mulut","hati",
  "buku","meja","kursi","pintu","jendela","mobil","motor","sepeda","kapal","pesawat",
  "uang","harga","beli","jual","pasar","sekolah","guru","murid","teman","keluarga",
  "ayah","ibu","anak","kakak","adik","nama","suara","warna","bentuk","belajar",
];

export const INDONESIAN_EXTRA: string[] = [
  "sebenarnya","kemudian","sehingga","walaupun","meskipun","sedangkan","terhadap",
  "mengenai","berdasarkan","sebagian","pemerintah","masyarakat","pendidikan",
  "kesehatan","pekerjaan","perusahaan","teknologi","informasi","komputer","jaringan",
  "program","aplikasi","perangkat","pengguna","pengembangan","penelitian","percobaan",
  "pengalaman","kemampuan","keputusan","perubahan","perkembangan","pertumbuhan",
  "lingkungan","kebudayaan","kebebasan","keadilan","kebenaran","keindahan",
  "persahabatan","kebahagiaan","kesempatan","tantangan","perjuangan","semangat",
  "harapan","impian","tujuan","rencana","kegiatan","kebiasaan","pengetahuan",
  "keterampilan","tanggung","jawab","kerjasama","komunikasi","perhatian","penghargaan",
];

// ---------------------------------------------------------------------------
// Word pools keyed by language
// ---------------------------------------------------------------------------

const WORD_POOLS: Record<string, { base: string[]; extended: string[] }> = {
  english: { base: ENGLISH_200, extended: COMMON_500_EXTRA },
  indonesian: { base: INDONESIAN_200, extended: INDONESIAN_EXTRA },
};

/** Languages that ship with a built-in word pool. */
export const SUPPORTED_LANGUAGES = Object.keys(WORD_POOLS);

/** Resolve the word pool for a language, falling back to English. */
export function getWordPool(language = "english", extended = false): string[] {
  const pool = WORD_POOLS[language] ?? WORD_POOLS.english;
  return extended ? [...pool.base, ...pool.extended] : pool.base;
}

export const PUNCTUATION_MARKS = [",", ".", "!", "?", ";", ":"];

interface GenerateOptions {
  wordCount: number;
  seed?: number;
  punctuation?: boolean;
  numbers?: boolean;
  /** Use the extended word pool for more variety. */
  extended?: boolean;
  /** Language of the word pool (defaults to English). */
  language?: string;
}

/** Build a randomized list of words with optional punctuation / numbers. */
export function generateWords({
  wordCount,
  seed = Math.floor(Math.random() * 2 ** 31),
  punctuation = false,
  numbers = false,
  extended = false,
  language = "english",
}: GenerateOptions): string[] {
  const rng = mulberry32(seed);
  const pool = getWordPool(language, extended);

  const result: string[] = [];
  // shuffle a working copy and cycle through it to avoid immediate repeats
  let bag = shuffle(pool, rng);
  let idx = 0;

  for (let i = 0; i < wordCount; i++) {
    if (idx >= bag.length) {
      bag = shuffle(pool, rng);
      idx = 0;
    }
    let word = bag[idx++];

    if (numbers && rng() < 0.18) {
      // replace this slot with a 1-4 digit number
      const len = 1 + Math.floor(rng() * 4);
      let num = "";
      for (let d = 0; d < len; d++) num += Math.floor(rng() * 10).toString();
      word = num;
    }

    if (punctuation) {
      // capitalize start of "sentences" and append marks occasionally
      if (i === 0 || result.length > 0) {
        if (rng() < 0.12) {
          const mark = PUNCTUATION_MARKS[Math.floor(rng() * PUNCTUATION_MARKS.length)];
          word = word + mark;
        }
      }
      if (rng() < 0.15) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
    }

    result.push(word);
  }

  // ensure the very first word starts capitalized in punctuation mode
  if (punctuation && result.length > 0) {
    result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1);
  }

  return result;
}

/** Continuously extend a word list (used by time/infinite modes). */
export function extendWords(current: string[], by: number, options: Omit<GenerateOptions, "wordCount">): string[] {
  const more = generateWords({ ...options, wordCount: by, seed: Math.floor(Math.random() * 2 ** 31) });
  return [...current, ...more];
}
