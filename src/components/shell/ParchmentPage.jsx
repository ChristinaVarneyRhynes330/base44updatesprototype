function buildSegments(text, quotes) {
  const ranges = [];
  quotes.filter(Boolean).forEach((quote) => {
    const index = text.indexOf(quote);
    if (index >= 0) ranges.push([index, index + quote.length]);
  });
  if (ranges.length === 0) return [{ text, marked: false }];
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0]];
  for (let i = 1; i < ranges.length; i += 1) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
    else merged.push(ranges[i]);
  }
  const segments = [];
  let cursor = 0;
  merged.forEach(([start, end]) => {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), marked: false });
    segments.push({ text: text.slice(start, end), marked: true });
    cursor = end;
  });
  if (cursor < text.length) segments.push({ text: text.slice(cursor), marked: false });
  return segments;
}

export default function ParchmentPage({ text, quotes = [] }) {
  const segments = buildSegments(text || "", quotes);
  return (
    <div className="surface-parchment rounded-lg px-5 py-5">
      <p className="whitespace-pre-wrap font-mono text-[12.5px] leading-[1.85] text-brand-espresso">
        {segments.map((segment, index) =>
          segment.marked ? (
            <mark key={index} className="parchment-mark text-brand-espresso">
              {segment.text}
            </mark>
          ) : (
            <span key={index}>{segment.text}</span>
          )
        )}
      </p>
    </div>
  );
}