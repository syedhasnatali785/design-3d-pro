import sys

with open('src/AppComplete.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target_import = "import { FerrisWheelGallery } from './components/ui/ferris-wheel-gallery'\n"
print('target_import in text:', target_import in text)

p_test = text.find('// DevCore Verified Client Testimonials for Ferris Wheel Gallery')
p_test_end = text.find('const TRANSITION_STORIES = [')
print('TESTIMONIAL_ITEMS span:', p_test, p_test_end)

p_ferris = text.find("id: 'testimonials-ferris-stage'")
print('ferris-stage at:', p_ferris)

p_ref = text.find('const ferrisWrapRef = useRef(null)')
print('ferrisWrapRef at:', p_ref)

p_tick = text.find('// Update Ferris Wheel Gallery (Clouds frames 24.5 to 56.0)')
print('ferris tick at:', p_tick)

p_jsx = text.find('{/* Interactive Ferris Wheel Gallery (Mounted during clouds testimonials section) */}')
print('ferris jsx at:', p_jsx)

