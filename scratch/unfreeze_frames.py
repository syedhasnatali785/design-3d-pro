import sys

with open('src/AppComplete.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

crlf = '\r\n' in text
content = text.replace('\r\n', '\n')

old_fn = """// Card-Freeze Timing: Freezes the background 3D camera frame completely while any card or services carousel is active
// so the content remains rock-solid and smooth BEFORE the camera moves forward to the next scene.
function getFrozenFrameProgress(progress) {
  // During Polaroid services carousel window, freeze camera cleanly at frame 21
  const servStart = tunnelFrameToProgress(21.0)
  const servEnd = tunnelFrameToProgress(78.0)
  if (progress >= servStart && progress <= servEnd) {
    return servStart
  }

  for (let i = 0; i < TRANSITION_STORIES.length; i++) {
    const s = TRANSITION_STORIES[i]
    if (s.type === 'card' && s.aliveStart && s.end && progress >= s.start && progress <= s.end) {
      // Freeze the background camera at the card's entry frame!
      return s.start
    }
  }
  return progress
}"""

new_fn = """// Camera Frame Progression:
// Background 3D camera moves smoothly in real-time with scroll through the icy tunnel while polaroid cards swing along the string.
function getFrozenFrameProgress(progress) {
  // Direct progression with user scroll (camera moves forward together with cards)
  return progress
}"""

assert old_fn in content, "old_fn not found"
content = content.replace(old_fn, new_fn, 1)

if crlf:
    content = content.replace('\n', '\r\n')

with open('src/AppComplete.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated getFrozenFrameProgress to allow camera to move with scroll!")

