import re

with open('src/AppComplete.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    "import { FannedCardStack } from './components/ui/fanned-card-stack'",
    "import { AnimatedTestimonialsStack } from './components/ui/animated-testimonials-stack'"
)

# Add src property to each testimonial in TESTIMONIAL_ITEMS
pattern = r'(badge:\s*"[^"]+",\s*\n\s*avatar:\s*"([^"]+)")'
def repl(m):
    avatar_url = m.group(2)
    # create higher-res version for full-bleed card photo
    src_url = avatar_url.replace('w=200', 'w=800')
    return f'{m.group(1)},\n    src: "{src_url}"'

code = re.sub(pattern, repl, code)

code = code.replace('<FannedCardStack', '<AnimatedTestimonialsStack')

with open('src/AppComplete.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('AppComplete.jsx updated cleanly with AnimatedTestimonialsStack')

