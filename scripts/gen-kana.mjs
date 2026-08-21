import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC_DIR = process.argv[2];
const OUT = new URL('../src/lib/data/kana.ts', import.meta.url).pathname;

const ROMAJI = {
	0x3041: null, 0x3042: 'a', 0x3044: 'i', 0x3046: 'u', 0x3048: 'e', 0x304a: 'o',
	0x304b: 'ka', 0x304c: 'ga', 0x304d: 'ki', 0x304e: 'gi', 0x304f: 'ku', 0x3050: 'gu',
	0x3051: 'ke', 0x3052: 'ge', 0x3053: 'ko', 0x3054: 'go',
	0x3055: 'sa', 0x3056: 'za', 0x3057: 'shi', 0x3058: 'ji', 0x3059: 'su', 0x305a: 'zu',
	0x305b: 'se', 0x305c: 'ze', 0x305d: 'so', 0x305e: 'zo',
	0x305f: 'ta', 0x3060: 'da', 0x3061: 'chi', 0x3062: 'ji', 0x3063: null,
	0x3064: 'tsu', 0x3065: 'zu', 0x3066: 'te', 0x3067: 'de', 0x3068: 'to', 0x3069: 'do',
	0x306a: 'na', 0x306b: 'ni', 0x306c: 'nu', 0x306d: 'ne', 0x306e: 'no',
	0x306f: 'ha', 0x3070: 'ba', 0x3071: 'pa', 0x3072: 'hi', 0x3073: 'bi', 0x3074: 'pi',
	0x3075: 'fu', 0x3076: 'bu', 0x3077: 'pu', 0x3078: 'he', 0x3079: 'be', 0x307a: 'pe',
	0x307b: 'ho', 0x307c: 'bo', 0x307d: 'po',
	0x307e: 'ma', 0x307f: 'mi', 0x3080: 'mu', 0x3081: 'me', 0x3082: 'mo',
	0x3083: null, 0x3084: 'ya', 0x3085: null, 0x3086: 'yu', 0x3087: null, 0x3088: 'yo',
	0x3089: 'ra', 0x308a: 'ri', 0x308b: 'ru', 0x308c: 're', 0x308d: 'ro',
	0x308e: null, 0x308f: 'wa', 0x3090: 'wi', 0x3091: 'we', 0x3092: 'wo', 0x3093: 'n',
	0x3094: 'vu', 0x3095: null, 0x3096: null,
	0x30a1: null, 0x30a2: 'a', 0x30a4: 'i', 0x30a6: 'u', 0x30a8: 'e', 0x30aa: 'o',
	0x30ab: 'ka', 0x30ac: 'ga', 0x30ad: 'ki', 0x30ae: 'gi', 0x30af: 'ku', 0x30b0: 'gu',
	0x30b1: 'ke', 0x30b2: 'ge', 0x30b3: 'ko', 0x30b4: 'go',
	0x30b5: 'sa', 0x30b6: 'za', 0x30b7: 'shi', 0x30b8: 'ji', 0x30b9: 'su', 0x30ba: 'zu',
	0x30bb: 'se', 0x30bc: 'ze', 0x30bd: 'so', 0x30be: 'zo',
	0x30bf: 'ta', 0x30c0: 'da', 0x30c1: 'chi', 0x30c2: null, 0x30c3: null,
	0x30c4: 'tsu', 0x30c5: 'zu', 0x30c6: 'te', 0x30c7: 'de', 0x30c8: 'to', 0x30c9: 'do',
	0x30ca: 'na', 0x30cb: 'ni', 0x30cc: 'nu', 0x30cd: 'ne', 0x30ce: 'no',
	0x30cf: 'ha', 0x30d0: 'ba', 0x30d1: 'pa', 0x30d2: 'hi', 0x30d3: 'bi', 0x30d4: 'pi',
	0x30d5: 'fu', 0x30d6: 'bu', 0x30d7: 'pu', 0x30d8: 'he', 0x30d9: 'be', 0x30da: 'pe',
	0x30db: 'ho', 0x30dc: 'bo', 0x30dd: 'po',
	0x30de: 'ma', 0x30df: 'mi', 0x30e0: 'mu', 0x30e1: 'me', 0x30e2: 'mo',
	0x30e3: null, 0x30e4: 'ya', 0x30e5: null, 0x30e6: 'yu', 0x30e7: null, 0x30e8: 'yo',
	0x30e9: 'ra', 0x30ea: 'ri', 0x30eb: 'ru', 0x30ec: 're', 0x30ed: 'ro',
	0x30ee: null, 0x30ef: 'wa', 0x30f0: 'wi', 0x30f1: 'we', 0x30f2: 'wo', 0x30f3: 'n',
	0x30f4: 'vu', 0x30f5: 'ka', 0x30f6: 'ke', 0x30f7: 'va', 0x30f8: 'vi', 0x30f9: 've', 0x30fa: 'vo'
};

const entries = [];

for (const file of readdirSync(SRC_DIR).sort()) {
	const cpStr = file.slice(0, 5);
	if (file.includes('-') || !/^[0-9a-f]{5}\.svg$/.test(file)) continue;
	const cp = parseInt(cpStr, 16);
	const romaji = ROMAJI[cp];
	if (!romaji) continue;

	const xml = readFileSync(join(SRC_DIR, file), 'utf8');
	const strokes = [...xml.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
	if (strokes.length === 0) continue;

	entries.push({
		char: String.fromCodePoint(cp),
		romaji,
		type: cp < 0x30a0 ? ('h' ) : ('k'),
		strokes
	});
}

entries.sort((a, b) => a.char.codePointAt(0) - b.char.codePointAt(0));

const body = entries
	.map((e) => `\t{ char: '${e.char}', romaji: '${e.romaji}', type: '${e.type}', strokes: [${e.strokes.map((s) => `'${s}'`).join(',')}], strokeCount: ${e.strokes.length} }`)
	.join(',\n');

writeFileSync(
	OUT,
	`// Stroke order data derived from KanjiVG (https://github.com/KanjiVG/kanjivg), licensed CC BY-SA 3.0.
// Regenerate with: node scripts/gen-kana.mjs <path-to-kanjivg-svg-dir>

export type KanaType = 'h' | 'k';

export interface Kana {
	char: string;
	romaji: string;
	type: KanaType;
	strokes: string[];
	strokeCount: number;
}

export const kana: Kana[] = [
${body}
];
`
);

console.log(`wrote ${entries.length} kana to ${OUT}`);
