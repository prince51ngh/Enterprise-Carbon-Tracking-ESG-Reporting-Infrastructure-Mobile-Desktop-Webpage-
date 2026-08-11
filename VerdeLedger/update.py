import os
import re

files = ['about.html', 'contact.html', 'pricing.html', 'impact.html', 'resources.html', 'feature-carbon.html', 'feature-finance.html', 'estimator.html', 'compliance.html']

meta_tags = """    <meta property="og:title" content="VerdeLedger // Integrated Sustainability Accounting">
    <meta property="og:description" content="VerdeLedger Analytics — integrated sustainability accounting that unifies corporate carbon ledger tracking with financial reporting for enterprise organizations.">
    <meta property="og:image" content="favicon.svg">
    <meta property="og:type" content="website">
    <title>VerdeLedger // """

favicon_link = """    <link rel="icon" type="image/svg+xml" href="favicon.svg">
    <link rel="preconnect\""""

header_logo = """            <a href="index.html" class="site-brand">
                <img src="favicon.svg" alt="Logo" width="20" height="20" style="vertical-align: middle; margin-right: 6px;">
                Verde<span>Ledger</span>
            </a>"""

theme_toggle = """                </ul>
                <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">🌙</button>
            </nav>"""

scroll_bar = """    </header>

    <div class="scroll-progress-container">
        <div id="scroll-progress-bar" class="scroll-progress-bar"></div>
    </div>

    <main class="page-body">"""

footer_block = """    <footer>
        <div class="footer-rich">
            <div class="footer-col">
                <a href="index.html" class="site-brand" style="margin-bottom: 16px; display: inline-block;">
                    <img src="favicon.svg" alt="Logo" width="18" height="18" style="vertical-align: middle; margin-right: 4px;">
                    Verde<span>Ledger</span>
                </a>
                <p style="font-size: 13px; color: var(--txt-secondary);">Unified sustainability accounting and financial reporting for modern enterprises.</p>
            </div>
            <div class="footer-col">
                <h4>System</h4>
                <ul>
                    <li><a href="feature-carbon.html">Carbon Logic</a></li>
                    <li><a href="feature-finance.html">Capital Ledger</a></li>
                    <li><a href="estimator.html">Carbon Estimator</a></li>
                    <li><a href="compliance.html">Standards</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Company</h4>
                <ul>
                    <li><a href="about.html">Corporate Blueprint</a></li>
                    <li><a href="impact.html">Case Log</a></li>
                    <li><a href="pricing.html">Plans</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Newsletter</h4>
                <form class="newsletter-form" id="newsletter-form" style="flex-direction: row; align-items: stretch; margin-bottom: 8px;">
                    <input type="email" placeholder="Email address..." required style="width: 100%; border-radius: var(--r-sm) 0 0 var(--r-sm);">
                    <button type="submit" style="border-radius: 0 var(--r-sm) var(--r-sm) 0;">Go</button>
                </form>
                <p id="nl-message" style="font-size: 11px; min-height: 14px;"></p>
            </div>
        </div>
        <div class="footer-inner" style="border-top: none; padding-top: 0;">
            <div class="footer-bottom" style="width: 100%;">
                <p>&copy; 2026 VerdeLedger Systems. All rights reserved.</p>
                <div class="social-links">
                    <a href="#">LinkedIn</a>
                    <a href="#">Twitter</a>
                </div>
            </div>
        </div>
    </footer>"""

for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        html = file.read()
    
    if 'og:title' not in html:
        html = re.sub(r'<title>VerdeLedger // ', meta_tags, html)
    if 'favicon.svg' not in html:
        html = re.sub(r'<link rel="preconnect"', favicon_link, html)
    
    html = re.sub(r'<a href="index\.html" class="site-brand">Verde<span>Ledger</span></a>', header_logo, html)
    
    if 'id="theme-toggle"' not in html:
        html = re.sub(r'</ul>\s*</nav>', theme_toggle, html)
    
    if 'scroll-progress-container' not in html:
        html = re.sub(r'</header>\s*<main class="page-body">', scroll_bar, html)
    
    if 'footer-rich' not in html:
        html = re.sub(r'<footer>[\s\S]*?</footer>', footer_block, html)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(html)

print("Updated files.")
