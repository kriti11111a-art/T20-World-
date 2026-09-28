"""
Trade Genius Complete Multi-Language PDF Generator
Full 10-page PDFs in 6 languages: English, Hindi, Urdu, Spanish, French, Arabic
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os
import random

PAGE_WIDTH, PAGE_HEIGHT = A4

# Colors
DARK_BG = colors.HexColor('#0a0a1a')
BRIGHT_YELLOW = colors.HexColor('#FFFF00')
BRIGHT_GREEN = colors.HexColor('#39FF14')
CANDLE_GREEN = colors.HexColor('#00C853')
CANDLE_RED = colors.HexColor('#FF1744')
WHITE = colors.white
CYAN = colors.HexColor('#00FFFF')
BOX_BG = colors.HexColor('#1a1a2e')
RED_ALERT = colors.HexColor('#FF6B6B')

# Complete Language Content
LANG_CONTENT = {
    'en': {
        'title': 'Trade Genius',
        'subtitle': 'Investment Bot Trading Platform',
        'tagline': 'Earn 5.5% to 7% Daily ROI for 20 Days',
        'network': 'BSC Network | BEP-20 USDT',
        'website': 'tradegeniushub.in',
        'footer': 'Trade Genius | tradegeniushub.in',
        'features': [
            '> Daily Automated ROI at 12:00 AM IST',
            '> Transparent & Secure',
            '> 5-Level Referral System',
            '> Salary Rank System',
            '> Instant Withdrawals'
        ],
        'page2_title': 'Trade Genius in One Look',
        'page2_items': [
            ('1. Smart Investment System', '20-day earning cycles with daily ROI'),
            ('2. Daily Income at 12 AM IST', 'Automatic ROI credited to your account'),
            ('3. 4 Investment Slabs', 'Higher investment = Higher ROI (5.5% to 7%)'),
            ('4. 5-Level Referral System', 'Earn 1% on each level of referrals'),
            ('5. Salary Rank System', 'Daily salary based on team performance'),
            ('6. Withdraw or Recompound', 'Flexible options for your earnings'),
            ('7. Minimum $1 Withdrawal', 'Low minimum, 5% withdrawal fee'),
        ],
        'page3_title': 'How Trade Genius Works',
        'page3_steps': [
            ('Step 1: Register', ['Create account with email', 'Use referral code (optional)', 'Connect BEP-20 wallet']),
            ('Step 2: Deposit USDT', ['Minimum $1 USDT deposit', 'Deposit via BSC network', '100% goes to investment']),
            ('Step 3: Choose Slab', ['$1-$19: 5.5% daily', '$20-$299: 6.0% daily', '$300-$999: 6.5% daily', '$1000-$10000: 7.0% daily']),
            ('Step 4: Earn Daily ROI', ['ROI at 12 AM IST', '20 days per investment', 'Withdraw or Recompound']),
        ],
        'page4_title': 'Investment Slabs',
        'page4_headers': ['Slab Name', 'Investment', 'Daily ROI', 'Duration', 'Total ROI'],
        'page4_rows': [
            ['Bot Slab One', '$1 - $19', '5.5%', '20 Days', '110%'],
            ['Bot Slab Two', '$20 - $299', '6.0%', '20 Days', '120%'],
            ['Bot Slab Three', '$300 - $2,999', '6.5%', '20 Days', '130%'],
            ['Bot Slab Four', '$3,000 - $10,000', '7.0%', '20 Days', '140%'],
        ],
        'page4_note': 'Note: Unlimited investments allowed',
        'page5_title': '5-Level Referral System',
        'page5_subtitle': 'Earn 1% commission on each level!',
        'page5_headers': ['Level', 'Commission', 'Example ($100)'],
        'page5_rows': [['Level 1', '1%', '$1.00'], ['Level 2', '1%', '$1.00'], ['Level 3', '1%', '$1.00'], ['Level 4', '1%', '$1.00'], ['Level 5', '1%', '$1.00']],
        'page5_elig_title': 'Level Income Eligibility:',
        'page5_elig': ['$50+ wallet balance = 3 levels eligible', '$100+ wallet balance = 5 levels eligible'],
        'page5_bonus_title': 'Direct Referral Bonus:',
        'page5_bonus': ['$10 bonus when referral deposits $50+', 'Referrer must have $50+ wallet balance'],
        'page6_title': 'Salary Rank System',
        'page6_subtitle': 'Earn Daily Salary Based on Team Performance!',
        'page6_headers': ['Rank', 'Stars', 'Active Team', 'Team Invest', 'Daily Salary'],
        'page6_rows': [
            ['Bronze', '*', '10+', '$2,000+', '$0.50'],
            ['Silver', '**', '30+', '$5,000+', '$1.00'],
            ['Gold', '***', '50+', '$10,000+', '$1.50'],
            ['Platinum', '****', '100+', '$25,000+', '$2.00'],
            ['Diamond', '*****', '500+', '$50,000+', '$5.00'],
            ['Crown', '******', '1000+', '$100,000+', '$10.00'],
        ],
        'page6_terms_title': 'Salary Terms & Conditions:',
        'page6_terms': [
            'Active Team Member = User with $50+ total investment',
            'Team Investment = Sum of all downline investments',
            'Salary is credited daily at 12:05 AM IST',
            'You must maintain rank criteria to receive salary',
            'Salary calculated based on previous day team status',
        ],
        'page7_title': 'Withdraw or Recompound',
        'page7_opt1_title': 'Option 1: Withdraw',
        'page7_opt1': ['Minimum Withdrawal: $1 USDT', 'Withdrawal Fee: 5%', 'Processing Time: 1-6 hours', 'Withdrawals to locked wallet only', 'Lock your wallet address for security'],
        'page7_opt2_title': 'Option 2: Recompound',
        'page7_opt2': ['Re-invest your ROI earnings', 'Creates NEW investment with new 20-day cycle', 'Slab determined by compound amount', 'Exponential growth potential!', 'No fee on recompounding'],
        'page8_title': 'Terms & Conditions',
        'page8_sections': [
            ('Investment Terms:', ['Minimum investment: $1 USDT', 'Maximum investment: $10,000 per slab', 'Investment duration: 20 days fixed', 'Daily ROI credited at 12:00 AM IST', 'Multiple investments allowed simultaneously']),
            ('Referral Terms:', ['Level income requires $50+ wallet balance for 3 levels', 'Level income requires $100+ wallet balance for 5 levels', 'Direct bonus ($10) requires referrer $50+ balance', 'Referral income is instant upon deposit']),
            ('Salary Terms:', ['Active member = Team member with $50+ investment', 'Both Active Team Size AND Team Investment required', 'Salary credited daily at 12:05 AM IST', 'Rank calculated based on previous day data']),
            ('Withdrawal Terms:', ['Minimum withdrawal: $1 USDT', '5% withdrawal fee applies', 'Must lock wallet address before withdrawal', 'Processing time: 1-6 hours']),
        ],
        'page9_title': 'Key Points to Remember',
        'page9_points': [
            ('> Duration', '20 days per investment'),
            ('> Daily ROI', '12:00 AM IST automatic'),
            ('> Salary', '12:05 AM IST based on rank'),
            ('> Unlimited', 'Multiple investments allowed'),
            ('> Options', 'Withdraw or Recompound'),
            ('> Minimum', '$1 withdrawal, 5% fee'),
            ('> Referral', '5 levels, 1% each'),
            ('> Security', 'Lock wallet for withdrawals'),
        ],
        'page9_cta': 'Start Investing Today!',
        'page10_thankyou': 'Thank You!',
        'page10_line1': 'Join Trade Genius and start your',
        'page10_line2': 'investment journey today!',
        'support': 'Support: support@tradegeniushub.in',
    },
    'hi': {
        'title': 'Trade Genius',
        'subtitle': 'Investment Bot Trading Platform',
        'tagline': '20 दिनों के लिए 5.5% से 7% Daily ROI कमाएं',
        'network': 'BSC Network | BEP-20 USDT',
        'website': 'tradegeniushub.in',
        'footer': 'Trade Genius | tradegeniushub.in',
        'features': [
            '> 12:00 AM IST पर Daily Automated ROI',
            '> पारदर्शी और सुरक्षित',
            '> 5-Level Referral System',
            '> Salary Rank System',
            '> तत्काल Withdrawals'
        ],
        'page2_title': 'Trade Genius एक नज़र में',
        'page2_items': [
            ('1. Smart Investment System', '20-day earning cycles with daily ROI'),
            ('2. Daily Income 12 AM IST पर', 'Automatic ROI आपके account में'),
            ('3. 4 Investment Slabs', 'ज़्यादा investment = ज़्यादा ROI (5.5% to 7%)'),
            ('4. 5-Level Referral System', 'हर level पर 1% commission'),
            ('5. Salary Rank System', 'Team performance पर daily salary'),
            ('6. Withdraw या Recompound', 'अपनी कमाई के लिए flexible options'),
            ('7. Minimum $1 Withdrawal', 'Low minimum, 5% fee'),
        ],
        'page3_title': 'Trade Genius कैसे काम करता है',
        'page3_steps': [
            ('Step 1: Register करें', ['Email से account बनाएं', 'Referral code use करें (optional)', 'BEP-20 wallet connect करें']),
            ('Step 2: USDT Deposit करें', ['Minimum $1 USDT deposit', 'BSC network से deposit', '100% investment में जाता है']),
            ('Step 3: Slab चुनें', ['$1-$19: 5.5% daily', '$20-$299: 6.0% daily', '$300-$999: 6.5% daily', '$1000-$10000: 7.0% daily']),
            ('Step 4: Daily ROI कमाएं', ['12 AM IST पर ROI', '20 days per investment', 'Withdraw या Recompound']),
        ],
        'page4_title': 'Investment Slabs',
        'page4_headers': ['Slab Name', 'Investment', 'Daily ROI', 'Duration', 'Total ROI'],
        'page4_rows': [
            ['Bot Slab One', '$1 - $19', '5.5%', '20 Days', '110%'],
            ['Bot Slab Two', '$20 - $299', '6.0%', '20 Days', '120%'],
            ['Bot Slab Three', '$300 - $2,999', '6.5%', '20 Days', '130%'],
            ['Bot Slab Four', '$3,000 - $10,000', '7.0%', '20 Days', '140%'],
        ],
        'page4_note': 'Note: Unlimited investments कर सकते हैं',
        'page5_title': '5-Level Referral System',
        'page5_subtitle': 'हर level पर 1% commission कमाएं!',
        'page5_headers': ['Level', 'Commission', 'Example ($100)'],
        'page5_rows': [['Level 1', '1%', '$1.00'], ['Level 2', '1%', '$1.00'], ['Level 3', '1%', '$1.00'], ['Level 4', '1%', '$1.00'], ['Level 5', '1%', '$1.00']],
        'page5_elig_title': 'Level Income Eligibility:',
        'page5_elig': ['$50+ wallet balance = 3 levels eligible', '$100+ wallet balance = 5 levels eligible'],
        'page5_bonus_title': 'Direct Referral Bonus:',
        'page5_bonus': ['$10 bonus जब referral $50+ deposit करे', 'Referrer के पास $50+ balance होना चाहिए'],
        'page6_title': 'Salary Rank System',
        'page6_subtitle': 'Team Performance पर Daily Salary कमाएं!',
        'page6_headers': ['Rank', 'Stars', 'Active Team', 'Team Invest', 'Daily Salary'],
        'page6_rows': [
            ['Bronze', '*', '10+', '$2,000+', '$0.50'],
            ['Silver', '**', '30+', '$5,000+', '$1.00'],
            ['Gold', '***', '50+', '$10,000+', '$1.50'],
            ['Platinum', '****', '100+', '$25,000+', '$2.00'],
            ['Diamond', '*****', '500+', '$50,000+', '$5.00'],
            ['Crown', '******', '1000+', '$100,000+', '$10.00'],
        ],
        'page6_terms_title': 'Salary Terms & Conditions:',
        'page6_terms': [
            'Active Team Member = User जिसका $50+ total investment हो',
            'Team Investment = सभी downline investments का sum',
            'Salary daily 12:05 AM IST पर credit होती है',
            'Rank criteria maintain करना ज़रूरी है',
            'Salary previous day की team status पर calculate होती है',
        ],
        'page7_title': 'Withdraw या Recompound',
        'page7_opt1_title': 'Option 1: Withdraw',
        'page7_opt1': ['Minimum Withdrawal: $1 USDT', 'Withdrawal Fee: 5%', 'Processing Time: 1-6 hours', 'सिर्फ locked wallet में withdrawal', 'Security के लिए wallet lock करें'],
        'page7_opt2_title': 'Option 2: Recompound',
        'page7_opt2': ['अपनी ROI earnings को re-invest करें', 'NEW investment create होगा 20-day cycle के साथ', 'Slab compound amount से decide होगा', 'Exponential growth का मौका!', 'Recompounding पर कोई fee नहीं'],
        'page8_title': 'Terms & Conditions',
        'page8_sections': [
            ('Investment Terms:', ['Minimum investment: $1 USDT', 'Maximum investment: $10,000 per slab', 'Investment duration: 20 days fixed', 'Daily ROI 12:00 AM IST पर credit', 'Multiple investments एक साथ allowed']),
            ('Referral Terms:', ['Level income के लिए $50+ wallet balance (3 levels)', 'Level income के लिए $100+ wallet balance (5 levels)', 'Direct bonus ($10) के लिए referrer का $50+ balance', 'Referral income deposit होते ही मिलती है']),
            ('Salary Terms:', ['Active member = Team member जिसका $50+ investment', 'Active Team Size और Team Investment दोनों ज़रूरी', 'Salary daily 12:05 AM IST पर credit', 'Rank previous day के data पर calculate']),
            ('Withdrawal Terms:', ['Minimum withdrawal: $1 USDT', '5% withdrawal fee लगती है', 'Withdrawal से पहले wallet lock करना ज़रूरी', 'Processing time: 1-6 hours']),
        ],
        'page9_title': 'Key Points याद रखें',
        'page9_points': [
            ('> Duration', '20 days per investment'),
            ('> Daily ROI', '12:00 AM IST automatic'),
            ('> Salary', '12:05 AM IST rank के हिसाब से'),
            ('> Unlimited', 'Multiple investments allowed'),
            ('> Options', 'Withdraw या Recompound'),
            ('> Minimum', '$1 withdrawal, 5% fee'),
            ('> Referral', '5 levels, 1% each'),
            ('> Security', 'Wallet lock करें withdrawals के लिए'),
        ],
        'page9_cta': 'आज ही Invest करें!',
        'page10_thankyou': 'धन्यवाद!',
        'page10_line1': 'Trade Genius join करें और अपना',
        'page10_line2': 'investment journey शुरू करें!',
        'support': 'Support: support@tradegeniushub.in',
    },
}

# Copy English content for other languages with key translations
for lang in ['ur', 'es', 'fr', 'ar']:
    LANG_CONTENT[lang] = LANG_CONTENT['en'].copy()

# Urdu specific
LANG_CONTENT['ur']['tagline'] = '20 دنوں کے لیے 5.5% سے 7% Daily ROI کمائیں'
LANG_CONTENT['ur']['page10_thankyou'] = 'شکریہ!'
LANG_CONTENT['ur']['page9_cta'] = 'آج ہی Invest کریں!'

# Spanish specific  
LANG_CONTENT['es']['tagline'] = 'Gana 5.5% a 7% ROI Diario por 20 Días'
LANG_CONTENT['es']['page10_thankyou'] = '¡Gracias!'
LANG_CONTENT['es']['page9_cta'] = '¡Invierte Hoy!'

# French specific
LANG_CONTENT['fr']['tagline'] = 'Gagnez 5.5% à 7% ROI Quotidien pendant 20 Jours'
LANG_CONTENT['fr']['page10_thankyou'] = 'Merci!'
LANG_CONTENT['fr']['page9_cta'] = 'Investissez Aujourd\'hui!'

# Arabic specific
LANG_CONTENT['ar']['tagline'] = 'اربح 5.5% إلى 7% عائد يومي لمدة 20 يوماً'
LANG_CONTENT['ar']['page10_thankyou'] = 'شكراً!'
LANG_CONTENT['ar']['page9_cta'] = 'استثمر اليوم!'


def draw_clean_background(c, page_width, page_height):
    c.setFillColor(DARK_BG)
    c.rect(0, 0, page_width, page_height, fill=1)

def draw_candlestick_box(c, page_width):
    box_height = 80
    box_y = 45
    margin = 30
    
    c.setStrokeColor(BRIGHT_GREEN)
    c.setLineWidth(5)
    c.rect(margin, box_y, page_width - 2*margin, box_height, fill=0)
    
    c.setFillColor(BOX_BG)
    c.setFillAlpha(0.9)
    c.rect(margin + 2, box_y + 2, page_width - 2*margin - 4, box_height - 4, fill=1)
    c.setFillAlpha(1)
    
    num_candles = 30
    candle_area_width = page_width - 2*margin - 20
    candle_width = candle_area_width / num_candles
    start_x = margin + 10
    
    for i in range(num_candles):
        x = start_x + i * candle_width
        is_green = random.random() > 0.4
        color = CANDLE_GREEN if is_green else CANDLE_RED
        
        body_height = random.randint(15, 45)
        body_y = box_y + 15 + random.randint(0, 15)
        wick_top = random.randint(5, 15)
        wick_bottom = random.randint(3, 10)
        
        c.setStrokeColor(color)
        c.setFillColor(color)
        c.setFillAlpha(0.9)
        
        wick_x = x + candle_width/2 - 1
        c.setLineWidth(1)
        c.line(wick_x, body_y - wick_bottom, wick_x, body_y + body_height + wick_top)
        
        body_width = candle_width * 0.6
        c.rect(x + candle_width*0.2, body_y, body_width, body_height, fill=1)
    
    c.setFillAlpha(1)

def draw_footer(c, page_width, text):
    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(page_width/2, 30, text)

def draw_yellow_box(c, x, y, width, height):
    c.setStrokeColor(BRIGHT_YELLOW)
    c.setLineWidth(5)
    c.rect(x, y, width, height, fill=0)

def draw_yellow_line(c, x_start, x_end, y):
    c.setStrokeColor(BRIGHT_YELLOW)
    c.setLineWidth(4)
    c.line(x_start, y, x_end, y)

def draw_table(c, x_start, y_start, headers, rows, col_widths, row_height=40):
    num_rows = len(rows) + 1
    table_width = sum(col_widths)
    table_height = num_rows * row_height
    
    c.setStrokeColor(BRIGHT_YELLOW)
    c.setLineWidth(5)
    c.rect(x_start, y_start - table_height, table_width, table_height, fill=0)
    
    c.setLineWidth(3)
    y = y_start
    for i in range(num_rows):
        c.line(x_start, y, x_start + table_width, y)
        y -= row_height
    
    x = x_start
    for i in range(len(col_widths) + 1):
        c.line(x, y_start, x, y_start - table_height)
        if i < len(col_widths):
            x += col_widths[i]
    
    # Headers
    y = y_start - 16
    x = x_start + 8
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 12)
    for i, header in enumerate(headers):
        c.drawString(x, y, header)
        x += col_widths[i]
    
    # Rows
    y -= row_height
    for row in rows:
        x = x_start + 8
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 11)
        for i, cell in enumerate(row):
            c.drawString(x, y, cell)
            x += col_widths[i]
        y -= row_height
    
    return y_start - table_height


def create_page_1(c, pw, ph, lang):
    """Cover Page"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    draw_yellow_box(c, 40, ph - 260, pw - 80, 130)
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 52)
    c.drawCentredString(pw/2, ph - 175, L['title'])
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(pw/2, ph - 225, L['subtitle'])
    
    draw_yellow_box(c, 55, ph - 365, pw - 110, 65)
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 17)
    c.drawCentredString(pw/2, ph - 338, L['tagline'])
    
    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(pw/2, ph - 395, L['network'])
    
    draw_yellow_box(c, 80, ph - 620, pw - 160, 200)
    y = ph - 440
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 15)
    for feature in L['features']:
        c.drawCentredString(pw/2, y, feature)
        y -= 35
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(pw/2, ph - 650, L['website'])
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_2(c, pw, ph, lang):
    """Overview Page"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(pw/2, ph - 75, L['page2_title'])
    draw_yellow_line(c, 80, pw - 80, ph - 90)
    
    y = ph - 135
    for title, desc in L['page2_items']:
        draw_yellow_box(c, 45, y - 55, pw - 90, 65)
        c.setFillColor(BRIGHT_YELLOW)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(70, y - 20, title)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(85, y - 44, desc)
        y -= 72
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_3(c, pw, ph, lang):
    """How It Works Page"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(pw/2, ph - 75, L['page3_title'])
    draw_yellow_line(c, 80, pw - 80, ph - 90)
    
    y = ph - 130
    for step_title, details in L['page3_steps']:
        box_height = 45 + len(details) * 26
        draw_yellow_box(c, 45, y - box_height + 20, pw - 90, box_height)
        
        c.setFillColor(BRIGHT_YELLOW)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(70, y, step_title)
        
        c.setFillColor(BRIGHT_GREEN)
        c.setFont("Helvetica-Bold", 14)
        for detail in details:
            y -= 26
            c.drawString(90, y, f"* {detail}")
        y -= 42
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_4(c, pw, ph, lang):
    """Investment Slabs Page"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(pw/2, ph - 75, L['page4_title'])
    draw_yellow_line(c, 80, pw - 80, ph - 90)
    
    col_widths = [95, 110, 80, 75, 80]
    x_start = (pw - sum(col_widths)) / 2
    y_start = ph - 150
    
    draw_table(c, x_start, y_start, L['page4_headers'], L['page4_rows'], col_widths, row_height=42)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(x_start, ph - 380, L['page4_note'])
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_5(c, pw, ph, lang):
    """5-Level Referral System"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(pw/2, ph - 70, L['page5_title'])
    draw_yellow_line(c, 60, pw - 60, ph - 85)
    
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(pw/2, ph - 110, L['page5_subtitle'])
    
    col_widths = [120, 120, 160]
    x_start = (pw - sum(col_widths)) / 2
    y_start = ph - 155
    
    table_bottom = draw_table(c, x_start, y_start, L['page5_headers'], L['page5_rows'], col_widths, row_height=35)
    
    # Eligibility box
    y = table_bottom - 25
    draw_yellow_box(c, 45, y - 80, pw - 90, 90)
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(65, y - 15, L['page5_elig_title'])
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y - 40, f"* {L['page5_elig'][0]}")
    c.drawString(80, y - 62, f"* {L['page5_elig'][1]}")
    
    # Bonus box
    y -= 110
    draw_yellow_box(c, 45, y - 70, pw - 90, 80)
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(65, y - 15, L['page5_bonus_title'])
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(80, y - 40, f"* {L['page5_bonus'][0]}")
    c.drawString(80, y - 60, f"* {L['page5_bonus'][1]}")
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_6(c, pw, ph, lang):
    """Salary Rank System"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(pw/2, ph - 65, L['page6_title'])
    draw_yellow_line(c, 60, pw - 60, ph - 80)
    
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(pw/2, ph - 100, L['page6_subtitle'])
    
    col_widths = [70, 65, 80, 95, 85]
    x_start = (pw - sum(col_widths)) / 2
    y_start = ph - 140
    
    table_bottom = draw_table(c, x_start, y_start, L['page6_headers'], L['page6_rows'], col_widths, row_height=32)
    
    # Terms box
    y = table_bottom - 15
    draw_yellow_box(c, 35, y - 150, pw - 70, 160)
    c.setFillColor(RED_ALERT)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(55, y - 18, L['page6_terms_title'])
    
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11)
    y_text = y - 45
    for term in L['page6_terms']:
        c.drawString(55, y_text, f"* {term}")
        y_text -= 24
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_7(c, pw, ph, lang):
    """Withdraw or Recompound"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(pw/2, ph - 75, L['page7_title'])
    draw_yellow_line(c, 60, pw - 60, ph - 90)
    
    # Option 1
    y = ph - 135
    draw_yellow_box(c, 45, y - 165, pw - 90, 175)
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(70, y - 15, L['page7_opt1_title'])
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 14)
    y_text = y - 50
    for item in L['page7_opt1']:
        c.drawString(85, y_text, f"* {item}")
        y_text -= 28
    
    # Option 2
    y = y - 195
    draw_yellow_box(c, 45, y - 165, pw - 90, 175)
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(70, y - 15, L['page7_opt2_title'])
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 14)
    y_text = y - 50
    for item in L['page7_opt2']:
        c.drawString(85, y_text, f"* {item}")
        y_text -= 28
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_8(c, pw, ph, lang):
    """Terms & Conditions"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(pw/2, ph - 65, L['page8_title'])
    draw_yellow_line(c, 80, pw - 80, ph - 80)
    
    y = ph - 110
    for section_title, items in L['page8_sections']:
        box_height = 35 + len(items) * 18
        draw_yellow_box(c, 35, y - box_height, pw - 70, box_height + 5)
        
        c.setFillColor(BRIGHT_YELLOW)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(55, y - 12, section_title)
        
        y -= 32
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 10)
        for item in items:
            c.drawString(55, y, f"* {item}")
            y -= 18
        y -= 12
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_9(c, pw, ph, lang):
    """Key Points"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(pw/2, ph - 75, L['page9_title'])
    draw_yellow_line(c, 60, pw - 60, ph - 90)
    
    y = ph - 135
    for key, value in L['page9_points']:
        draw_yellow_box(c, 70, y - 30, pw - 140, 40)
        c.setFillColor(BRIGHT_GREEN)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(90, y - 18, key)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(200, y - 18, value)
        y -= 50
    
    # CTA
    y -= 15
    draw_yellow_box(c, 90, y - 75, pw - 180, 85)
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(pw/2, y - 25, L['page9_cta'])
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(pw/2, y - 55, L['website'])
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def create_page_10(c, pw, ph, lang):
    """Thank You Page"""
    L = LANG_CONTENT[lang]
    draw_clean_background(c, pw, ph)
    
    draw_yellow_box(c, 70, ph/2 - 50, pw - 140, 190)
    
    c.setFillColor(BRIGHT_YELLOW)
    c.setFont("Helvetica-Bold", 52)
    c.drawCentredString(pw/2, ph/2 + 95, L['page10_thankyou'])
    draw_yellow_line(c, 140, pw - 140, ph/2 + 75)
    
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(pw/2, ph/2 + 30, L['page10_line1'])
    c.drawCentredString(pw/2, ph/2 + 5, L['page10_line2'])
    
    c.setFillColor(BRIGHT_GREEN)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(pw/2, ph/2 - 40, L['website'])
    
    c.setFillColor(CYAN)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(pw/2, ph/2 - 85, L['support'])
    
    draw_candlestick_box(c, pw)
    draw_footer(c, pw, L['footer'])


def generate_complete_pdf(lang, output_path):
    """Generate complete 10-page PDF for a language"""
    c = canvas.Canvas(output_path, pagesize=A4)
    
    create_page_1(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_2(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_3(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_4(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_5(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_6(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_7(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_8(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_9(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    c.showPage()
    create_page_10(c, PAGE_WIDTH, PAGE_HEIGHT, lang)
    
    c.save()
    print(f"Generated: {output_path}")


def generate_all_pdfs():
    """Generate complete PDFs for all 6 languages"""
    output_dir = "/app/backend/static"
    os.makedirs(output_dir, exist_ok=True)
    
    for lang in ['en', 'hi', 'ur', 'es', 'fr', 'ar']:
        output_path = f"{output_dir}/Trade_Genius_Guide_{lang.upper()}.pdf"
        generate_complete_pdf(lang, output_path)
    
    # Copy English as default
    import shutil
    shutil.copy(f"{output_dir}/Trade_Genius_Guide_EN.pdf", f"{output_dir}/Trade_Genius_Guide.pdf")
    print("\nAll 6 language PDFs generated successfully! (10 pages each)")


if __name__ == "__main__":
    generate_all_pdfs()
