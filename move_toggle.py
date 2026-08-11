import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

old_block = """                </ul>
                <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">🌙</button>
            </nav>"""

new_block = """                    <li><button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">🌙</button></li>
                </ul>
            </nav>"""

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if old_block in content:
        content = content.replace(old_block, new_block)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated {f}")
    else:
        print(f"Skipped {f} (pattern not found)")
