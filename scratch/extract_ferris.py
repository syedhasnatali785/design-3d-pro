import sys, json

transcript_path = r'C:\Users\syedh\.gemini\antigravity\brain\30a91e6c-b6fc-4959-8b4f-35b5c598da79\.system_generated\logs\transcript_full.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if i == 3313:
            data = json.loads(line)
            content = data.get('content', '')
            p1 = content.find('"use client";')
            p2 = content.find('```\r\n\r\nInstall NPM dependencies:')
            if p2 == -1:
                p2 = content.find('```\n\nInstall NPM dependencies:')
            if p2 == -1:
                p2 = content.rfind('```')
            print('p1:', p1, 'p2:', p2)
            code = content[p1:p2].strip()
            with open('src/components/ui/ferris-wheel-gallery.tsx', 'w', encoding='utf-8') as out_f:
                out_f.write(code)
            print('Extracted and written ferris-wheel-gallery.tsx! Size:', len(code))
            break

