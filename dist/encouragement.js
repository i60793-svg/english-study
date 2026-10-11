// Source-verified quotations. Chinese translations are provided for this app.
const encouragements = [
  {
    "en": "Optimism is the faith that leads to achievement; nothing can be done without hope.",
    "zh": "樂觀是通往成就的信念；沒有希望，就無法成事。",
    "author": "Helen Keller",
    "authorZh": "海倫凱勒",
    "source": "https://www.afb.org/about-afb/history/helen-keller/quotes"
  },
  {
    "en": "Education is the most powerful weapon which you can use to change the world.",
    "zh": "教育是你可以用來改變世界最有力的武器。",
    "author": "Nelson Mandela",
    "authorZh": "納爾遜・曼德拉",
    "source": "https://www.nelsonmandela.org/nm100-education"
  },
  {
    "en": "Nothing great was ever achieved without enthusiasm.",
    "zh": "沒有熱情，就無法成就偉大的事。",
    "author": "Ralph Waldo Emerson",
    "authorZh": "拉爾夫・沃爾多・愛默生",
    "source": "https://dev.gutenberg.org/cache/epub/2944/pg2944-images.html"
  },
  {
    "en": "The time is always right to do right.",
    "zh": "做對的事，任何時候都是好時機。",
    "author": "Martin Luther King Jr.",
    "authorZh": "馬丁・路德・金恩",
    "source": "https://kinginstitute.stanford.edu/king-papers/documents/address-delivered-freedom-fund-dinner-fifty-third-annual-convention-naacp"
  },
  {
    "en": "What you do makes a difference, and you have to decide what kind of difference you want to make.",
    "zh": "你的行動會帶來改變，而你必須決定自己想帶來什麼樣的改變。",
    "author": "Jane Goodall",
    "authorZh": "珍古德",
    "source": "https://janegoodall.org/news/jane-goodall-day-first-annual-day-of-action/"
  },
  {
    "en": "The only thing we have to fear is fear itself.",
    "zh": "我們唯一需要恐懼的，就是恐懼本身。",
    "author": "Franklin D. Roosevelt",
    "authorZh": "富蘭克林・羅斯福",
    "source": "https://www.fdrlibrary.org/first-inaugural-curriculum-hub"
  },
  {
    "en": "The noblest question in the world is What Good may I do in it?",
    "zh": "世上最崇高的問題是：我能在這個世界上做些什麼好事？",
    "author": "Benjamin Franklin",
    "authorZh": "班傑明・富蘭克林",
    "source": "https://prologue.blogs.archives.gov/2014/01/17/celebrating-benjamin-franklins-birthday-with-founders-online/"
  },
  {
    "en": "Our doubts are traitors, and make us lose the good we oft might win by fearing to attempt.",
    "zh": "疑慮會背叛我們，讓我們因害怕嘗試，而失去原本可能得到的成果。",
    "author": "William Shakespeare",
    "authorZh": "威廉・莎士比亞",
    "source": "https://www.opensourceshakespeare.org/views/plays/play_view.php?Act=1&Scene=4&Scope=scene&WorkID=measure",
    "work": "Measure for Measure · Lucio 台詞"
  }
];
function taipeiDate(now = new Date()) {
 return new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
function dailyEncouragement(now = new Date()) {
 const date = taipeiDate(now);
 const dayIndex = Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000);
 const quote = encouragements[((dayIndex % encouragements.length) + encouragements.length) % encouragements.length];
 return {date, ...quote};
}
