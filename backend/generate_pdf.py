from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

# Colors
DARK_BG = HexColor('#0a1628')
ACCENT = HexColor('#00FFD1')
GOLD = HexColor('#FFD700')
WHITE = HexColor('#FFFFFF')
GRAY = HexColor('#888888')
GREEN = HexColor('#00FF88')

def create_tradego_pdf(filename, lang='en'):
    """Generate TradeGo Guide PDF"""
    
    # Language content
    content = get_content(lang)
    
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=ACCENT,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=GOLD,
        spaceBefore=15,
        spaceAfter=10
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubHeading',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=ACCENT,
        spaceBefore=10,
        spaceAfter=5
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        textColor=HexColor('#333333'),
        spaceBefore=5,
        spaceAfter=5
    )
    
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontSize=10,
        textColor=HexColor('#444444'),
        leftIndent=20,
        spaceBefore=3,
        spaceAfter=3
    )
    
    center_style = ParagraphStyle(
        'CenterStyle',
        parent=styles['Normal'],
        fontSize=11,
        alignment=TA_CENTER,
        textColor=HexColor('#333333')
    )
    
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_CENTER,
        textColor=GRAY
    )
    
    story = []
    
    # Page 1: Cover
    story.append(Spacer(1, 100))
    story.append(Paragraph("TradeGo", title_style))
    story.append(Paragraph(content['subtitle'], center_style))
    story.append(Spacer(1, 30))
    story.append(Paragraph(content['tagline'], center_style))
    story.append(Spacer(1, 20))
    
    features = [
        "✓ 20 " + content['days'] + " | 5.5% - 7% Daily ROI",
        "✓ BSC Network | BEP-20 USDT",
        "✓ 12:00 AM IST " + content['daily_roi'],
        "✓ 10-Level Referral System",
        "✓ " + content['weekly_offer_title'],
        "✓ " + content['instant_withdraw']
    ]
    for f in features:
        story.append(Paragraph(f, center_style))
    
    story.append(Spacer(1, 40))
    story.append(Paragraph("tradegosmart.online", subheading_style))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 2: Features Overview
    story.append(Paragraph(content['features_title'], title_style))
    
    features_list = [
        ("1. " + content['smart_invest'], content['smart_invest_desc']),
        ("2. " + content['daily_income'], content['daily_income_desc']),
        ("3. " + content['four_slabs'], content['four_slabs_desc']),
        ("4. " + content['referral_system'], content['referral_desc']),
        ("5. " + content['salary_system'], content['salary_desc']),
        ("6. " + content['weekly_offer_title'], content['weekly_offer_short']),
        ("7. " + content['withdraw_recompound'], content['withdraw_desc']),
    ]
    
    for title, desc in features_list:
        story.append(Paragraph(title, subheading_style))
        story.append(Paragraph(desc, body_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 3: How to Start
    story.append(Paragraph(content['how_to_start'], title_style))
    
    steps = [
        (content['step1_title'], content['step1_points']),
        (content['step2_title'], content['step2_points']),
        (content['step3_title'], content['step3_points']),
        (content['step4_title'], content['step4_points']),
    ]
    
    for step_title, points in steps:
        story.append(Paragraph(step_title, subheading_style))
        for p in points:
            story.append(Paragraph("• " + p, bullet_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 4: Investment Slabs
    story.append(Paragraph(content['investment_slabs'], title_style))
    
    slab_data = [
        [content['slab_name'], content['investment'], content['daily_roi_label'], content['duration'], content['total_roi']],
        ['Bot Slab One', '$1 - $19', '5.5%', '20 ' + content['days'], '110%'],
        ['Bot Slab Two', '$20 - $299', '6.0%', '20 ' + content['days'], '120%'],
        ['Bot Slab Three', '$300 - $2,999', '6.5%', '20 ' + content['days'], '130%'],
        ['Bot Slab Four', '$3,000 - $10,000', '7.0%', '20 ' + content['days'], '140%'],
    ]
    
    slab_table = Table(slab_data, colWidths=[1.5*inch, 1.2*inch, 0.8*inch, 0.9*inch, 0.8*inch])
    slab_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), DARK_BG),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f5f5f5')),
        ('GRID', (0, 0), (-1, -1), 1, GRAY),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    story.append(slab_table)
    story.append(Spacer(1, 15))
    story.append(Paragraph(content['unlimited_note'], body_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 5: Weekly Special Offer (NEW PAGE)
    story.append(Paragraph("★ " + content['weekly_offer_title'] + " ★", title_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(content['weekly_offer_subtitle'], center_style))
    story.append(Spacer(1, 20))
    
    offer_data = [
        [content['offer_schedule'], content['offer_time'], content['offer_bonus']],
        [content['offer_days'], '6:00 PM - 8:00 PM IST', '10%'],
    ]
    
    offer_table = Table(offer_data, colWidths=[2*inch, 2*inch, 1.5*inch])
    offer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GOLD),
        ('TEXTCOLOR', (0, 0), (-1, 0), DARK_BG),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#fff8e1')),
        ('GRID', (0, 0), (-1, -1), 1, GOLD),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica-Bold'),
    ]))
    story.append(offer_table)
    story.append(Spacer(1, 20))
    
    story.append(Paragraph(content['offer_conditions_title'], subheading_style))
    offer_conditions = content['offer_conditions']
    for c in offer_conditions:
        story.append(Paragraph("✓ " + c, bullet_style))
    
    story.append(Spacer(1, 15))
    story.append(Paragraph(content['offer_example_title'], subheading_style))
    story.append(Paragraph(content['offer_example'], body_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 6: Referral System
    story.append(Paragraph(content['referral_title'], title_style))
    story.append(Paragraph(content['referral_subtitle'], center_style))
    story.append(Spacer(1, 15))
    
    ref_data = [
        [content['level'], content['commission'], content['example']],
        ['Level 1', '1%', '$1.00'],
        ['Level 2', '1%', '$1.00'],
        ['Level 3', '1%', '$1.00'],
        ['Level 4', '1%', '$1.00'],
        ['Level 5', '1%', '$1.00'],
        ['Level 6', '0.6%', '$0.60'],
        ['Level 7', '0.5%', '$0.50'],
        ['Level 8', '0.4%', '$0.40'],
        ['Level 9', '0.3%', '$0.30'],
        ['Level 10', '0.2%', '$0.20'],
    ]
    
    ref_table = Table(ref_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch])
    ref_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
        ('TEXTCOLOR', (0, 0), (-1, 0), DARK_BG),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f5f5f5')),
        ('GRID', (0, 0), (-1, -1), 1, GRAY),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    story.append(ref_table)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph(content['level_eligibility'], subheading_style))
    for e in content['eligibility_points']:
        story.append(Paragraph("• " + e, bullet_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 7: Salary Rank System
    story.append(Paragraph(content['salary_title'], title_style))
    story.append(Paragraph(content['salary_subtitle'], center_style))
    story.append(Spacer(1, 15))
    
    salary_data = [
        [content['rank'], content['stars'], content['active_team'], content['team_invest'], content['daily_salary_label']],
        ['Bronze', '★', '10+', '$2,000+', '$0.50'],
        ['Silver', '★★', '30+', '$5,000+', '$1.00'],
        ['Gold', '★★★', '50+', '$10,000+', '$1.50'],
        ['Platinum', '★★★★', '100+', '$25,000+', '$2.00'],
        ['Diamond', '★★★★★', '500+', '$50,000+', '$5.00'],
        ['Crown', '★★★★★★', '1000+', '$100,000+', '$10.00'],
    ]
    
    salary_table = Table(salary_data, colWidths=[0.9*inch, 0.8*inch, 0.9*inch, 1*inch, 0.9*inch])
    salary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GOLD),
        ('TEXTCOLOR', (0, 0), (-1, 0), DARK_BG),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#fff8e1')),
        ('GRID', (0, 0), (-1, -1), 1, GOLD),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    story.append(salary_table)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph(content['salary_terms_title'], subheading_style))
    for t in content['salary_terms']:
        story.append(Paragraph("• " + t, bullet_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 8: Withdraw & Recompound
    story.append(Paragraph(content['withdraw_title'], title_style))
    
    story.append(Paragraph(content['option_withdraw'], subheading_style))
    for w in content['withdraw_points']:
        story.append(Paragraph("• " + w, bullet_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph(content['option_recompound'], subheading_style))
    for r in content['recompound_points']:
        story.append(Paragraph("• " + r, bullet_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 9: Terms & Conditions
    story.append(Paragraph(content['terms_title'], title_style))
    
    story.append(Paragraph(content['invest_terms'], subheading_style))
    for t in content['invest_terms_points']:
        story.append(Paragraph("• " + t, bullet_style))
    
    story.append(Paragraph(content['referral_terms'], subheading_style))
    for t in content['referral_terms_points']:
        story.append(Paragraph("• " + t, bullet_style))
    
    story.append(Paragraph(content['salary_terms_heading'], subheading_style))
    for t in content['salary_terms_points']:
        story.append(Paragraph("• " + t, bullet_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 10: Key Points
    story.append(Paragraph(content['key_points_title'], title_style))
    
    key_points = content['key_points']
    for kp in key_points:
        story.append(Paragraph("✓ " + kp, body_style))
    
    story.append(Spacer(1, 30))
    story.append(Paragraph(content['start_now'], subheading_style))
    story.append(Paragraph("tradegosmart.online", center_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    story.append(PageBreak())
    
    # Page 11: Thank You
    story.append(Spacer(1, 150))
    story.append(Paragraph(content['thank_you'], title_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph(content['thank_you_msg'], center_style))
    story.append(Spacer(1, 40))
    story.append(Paragraph("tradegosmart.online", subheading_style))
    story.append(Paragraph("Support: support@tradegosmart.online", center_style))
    story.append(Spacer(1, 40))
    story.append(Paragraph("TradeGo | tradegosmart.online", footer_style))
    
    doc.build(story)
    print(f"Created: {filename}")


def get_content(lang):
    """Get content in specified language"""
    
    if lang == 'hi':
        return {
            'subtitle': 'Smart Investment Bot Trading Platform',
            'tagline': '20 दिन में 5.5% से 7% Daily ROI कमाएं',
            'days': 'Days',
            'daily_roi': 'पर Daily Automated ROI',
            'weekly_offer_title': 'Weekly Special Offer',
            'instant_withdraw': 'Instant Withdrawals',
            'features_title': 'TradeGo की विशेषताएं',
            'smart_invest': 'Smart Investment System',
            'smart_invest_desc': '20 दिन के earning cycles के साथ daily ROI',
            'daily_income': 'Daily Income 12 AM IST पर',
            'daily_income_desc': 'Automatic ROI आपके account में आएगा',
            'four_slabs': '4 Investment Slabs',
            'four_slabs_desc': 'ज्यादा investment = ज्यादा ROI (5.5% से 7%)',
            'referral_system': '10-Level Referral System',
            'referral_desc': 'हर level पर 1% commission',
            'salary_system': 'Salary Rank System',
            'salary_desc': 'Team performance पर daily salary',
            'weekly_offer_short': 'Sunday & Wednesday को 10% Deposit Bonus',
            'withdraw_recompound': 'Withdraw या Recompound',
            'withdraw_desc': 'अपनी कमाई को निकालें या reinvest करें',
            'how_to_start': 'कैसे शुरू करें?',
            'step1_title': 'Step 1: Register करें',
            'step1_points': ['Email से account बनाएं', 'Referral code use करें (optional)', 'BEP-20 wallet connect करें'],
            'step2_title': 'Step 2: USDT Deposit करें',
            'step2_points': ['Minimum $1 USDT deposit', 'BSC network पर deposit', '100% investment में जाएगा'],
            'step3_title': 'Step 3: Slab चुनें',
            'step3_points': ['$1-$19: 5.5% daily', '$20-$299: 6.0% daily', '$300-$2,999: 6.5% daily', '$3,000+: 7.0% daily'],
            'step4_title': 'Step 4: Daily ROI पाएं',
            'step4_points': ['12 AM IST पर ROI', '20 days per investment', 'Withdraw या Recompound'],
            'investment_slabs': 'Investment Slabs',
            'slab_name': 'Slab Name',
            'investment': 'Investment',
            'daily_roi_label': 'Daily ROI',
            'duration': 'Duration',
            'total_roi': 'Total ROI',
            'unlimited_note': 'Note: Unlimited investments कर सकते हैं',
            'weekly_offer_subtitle': 'हर हफ्ते 2 बार 10% Deposit Bonus पाएं!',
            'offer_schedule': 'Schedule',
            'offer_time': 'Time',
            'offer_bonus': 'Bonus',
            'offer_days': 'Sunday & Wednesday',
            'offer_conditions_title': 'Offer की शर्तें:',
            'offer_conditions': [
                'Offer सिर्फ Sunday और Wednesday को available है',
                'Time: शाम 6:00 PM से 8:00 PM IST',
                'Minimum deposit: $50 USDT',
                '10% bonus तुरंत आपके balance में add होगा',
                'Bonus withdrawable है'
            ],
            'offer_example_title': 'Example:',
            'offer_example': 'अगर आप Sunday 6:30 PM पर $100 deposit करते हैं, तो आपको $10 bonus मिलेगा। आपका total balance $110 होगा!',
            'referral_title': '10-Level Referral System',
            'referral_subtitle': 'L1-L5: 1% | L6-L10: 0.6%-0.2%',
            'level': 'Level',
            'commission': 'Commission',
            'example': 'Example ($100)',
            'level_eligibility': 'Level Income Eligibility:',
            'eligibility_points': ['$50+ wallet balance = 3 levels eligible', '$100+ wallet balance = 5 levels eligible', '$200+ wallet balance = 10 levels eligible', 'Direct Referral Bonus: $10 जब referral $50+ deposit करे'],
            'salary_title': 'Salary Rank System',
            'salary_subtitle': 'Team Performance पर Daily Salary पाएं!',
            'rank': 'Rank',
            'stars': 'Stars',
            'active_team': 'Active Team',
            'team_invest': 'Team Invest',
            'daily_salary_label': 'Daily Salary',
            'salary_terms_title': 'Salary Terms:',
            'salary_terms': ['Active Team Member = User जिसने $50+ total investment किया हो', 'Team Investment = आपकी downline investments का sum', 'Salary daily 12:05 AM IST पर credit होगी'],
            'withdraw_title': 'Withdraw और Recompound',
            'option_withdraw': 'Option 1: Withdraw',
            'withdraw_points': ['Minimum Withdrawal: $1 USDT', 'Withdrawal Fee: 5%', 'Processing Time: 1-6 hours', 'अपने locked wallet में withdrawal', 'Security के लिए wallet lock करें'],
            'option_recompound': 'Option 2: Recompound',
            'recompound_points': ['अपनी ROI earnings को re-invest करें', 'NEW investment create होगा 20-day cycle के साथ', 'Slab compound amount पर decide होगा', 'Exponential growth का फायदा!', 'Recompounding पर कोई fee नहीं'],
            'terms_title': 'Terms & Conditions',
            'invest_terms': 'Investment Terms:',
            'invest_terms_points': ['Minimum investment: $1 USDT', 'Maximum investment: $10,000 per slab', 'Investment duration: 20 days fixed', 'Daily ROI 12:00 AM IST पर credit', 'Multiple investments कर सकते हैं'],
            'referral_terms': 'Referral Terms:',
            'referral_terms_points': ['Level income के लिए $50+ wallet balance (3 levels)', 'Level income के लिए $100+ wallet balance (5 levels)', 'Direct bonus ($10) के लिए referrer का $50+ balance'],
            'salary_terms_heading': 'Salary Terms:',
            'salary_terms_points': ['Active member = Team member जिसने $50+ investment किया', 'Salary daily 12:05 AM IST पर credit'],
            'key_points_title': 'Key Points याद रखें',
            'key_points': ['Duration: 20 days per investment', 'Daily ROI: 12:00 AM IST automatic', 'Weekly Offer: Sunday & Wednesday 6-8 PM IST', 'Offer Bonus: 10% on $50+ deposits', 'Salary: 12:05 AM IST rank के हिसाब से', 'Unlimited: Multiple investments allowed', 'Options: Withdraw या Recompound', 'Minimum: $1 withdrawal, 5% fee', 'Referral: 10 levels (L1-L5: 1%, L6-L10: 0.6%-0.2%)'],
            'start_now': 'आज ही Invest करें!',
            'thank_you': 'धन्यवाद!',
            'thank_you_msg': 'TradeGo join करने के लिए धन्यवाद! अपनी investment journey शुरू करें!'
        }
    
    else:  # English (default) - used for all languages as base
        return {
            'subtitle': 'Smart Investment Bot Trading Platform',
            'tagline': 'Earn 5.5% to 7% Daily ROI in 20 Days',
            'days': 'Days',
            'daily_roi': 'Daily Automated ROI',
            'weekly_offer_title': 'Weekly Special Offer',
            'instant_withdraw': 'Instant Withdrawals',
            'features_title': 'TradeGo Features',
            'smart_invest': 'Smart Investment System',
            'smart_invest_desc': '20-day earning cycles with daily ROI',
            'daily_income': 'Daily Income at 12 AM IST',
            'daily_income_desc': 'Automatic ROI credited to your account',
            'four_slabs': '4 Investment Slabs',
            'four_slabs_desc': 'Higher investment = Higher ROI (5.5% to 7%)',
            'referral_system': '10-Level Referral System',
            'referral_desc': '1% commission on each level',
            'salary_system': 'Salary Rank System',
            'salary_desc': 'Daily salary based on team performance',
            'weekly_offer_short': '10% Deposit Bonus on Sunday & Wednesday',
            'withdraw_recompound': 'Withdraw or Recompound',
            'withdraw_desc': 'Withdraw your earnings or reinvest them',
            'how_to_start': 'How to Start?',
            'step1_title': 'Step 1: Register',
            'step1_points': ['Create account with Email', 'Use Referral code (optional)', 'Connect BEP-20 wallet'],
            'step2_title': 'Step 2: Deposit USDT',
            'step2_points': ['Minimum $1 USDT deposit', 'Deposit on BSC network', '100% goes to investment'],
            'step3_title': 'Step 3: Choose Slab',
            'step3_points': ['$1-$19: 5.5% daily', '$20-$299: 6.0% daily', '$300-$2,999: 6.5% daily', '$3,000+: 7.0% daily'],
            'step4_title': 'Step 4: Get Daily ROI',
            'step4_points': ['ROI at 12 AM IST', '20 days per investment', 'Withdraw or Recompound'],
            'investment_slabs': 'Investment Slabs',
            'slab_name': 'Slab Name',
            'investment': 'Investment',
            'daily_roi_label': 'Daily ROI',
            'duration': 'Duration',
            'total_roi': 'Total ROI',
            'unlimited_note': 'Note: You can make unlimited investments',
            'weekly_offer_subtitle': 'Get 10% Deposit Bonus twice every week!',
            'offer_schedule': 'Schedule',
            'offer_time': 'Time',
            'offer_bonus': 'Bonus',
            'offer_days': 'Sunday & Wednesday',
            'offer_conditions_title': 'Offer Conditions:',
            'offer_conditions': ['Offer available only on Sunday and Wednesday', 'Time: 6:00 PM to 8:00 PM IST', 'Minimum deposit: $50 USDT', '10% bonus instantly added to your balance', 'Bonus is withdrawable'],
            'offer_example_title': 'Example:',
            'offer_example': 'If you deposit $100 on Sunday at 6:30 PM, you will get $10 bonus. Your total balance will be $110!',
            'referral_title': '10-Level Referral System',
            'referral_subtitle': 'L1-L5: 1% | L6-L10: 0.6%-0.2%',
            'level': 'Level',
            'commission': 'Commission',
            'example': 'Example ($100)',
            'level_eligibility': 'Level Income Eligibility:',
            'eligibility_points': ['$50+ wallet balance = 3 levels eligible', '$100+ wallet balance = 5 levels eligible', '$200+ wallet balance = 10 levels eligible', 'Direct Referral Bonus: $10 when referral deposits $50+'],
            'salary_title': 'Salary Rank System',
            'salary_subtitle': 'Earn Daily Salary based on Team Performance!',
            'rank': 'Rank',
            'stars': 'Stars',
            'active_team': 'Active Team',
            'team_invest': 'Team Invest',
            'daily_salary_label': 'Daily Salary',
            'salary_terms_title': 'Salary Terms:',
            'salary_terms': ['Active Team Member = User with $50+ total investment', 'Team Investment = Sum of all downline investments', 'Salary credited daily at 12:05 AM IST'],
            'withdraw_title': 'Withdraw & Recompound',
            'option_withdraw': 'Option 1: Withdraw',
            'withdraw_points': ['Minimum Withdrawal: $1 USDT', 'Withdrawal Fee: 5%', 'Processing Time: 1-6 hours', 'Withdrawal to your locked wallet', 'Lock wallet for security'],
            'option_recompound': 'Option 2: Recompound',
            'recompound_points': ['Re-invest your ROI earnings', 'Creates NEW investment with 20-day cycle', 'Slab based on compound amount', 'Benefit from exponential growth!', 'No fee on recompounding'],
            'terms_title': 'Terms & Conditions',
            'invest_terms': 'Investment Terms:',
            'invest_terms_points': ['Minimum investment: $1 USDT', 'Maximum investment: $10,000 per slab', 'Investment duration: 20 days fixed', 'Daily ROI credited at 12:00 AM IST', 'Multiple investments allowed'],
            'referral_terms': 'Referral Terms:',
            'referral_terms_points': ['$50+ wallet balance for level income (3 levels)', '$100+ wallet balance for level income (5 levels)', '$50+ balance required for direct bonus ($10)'],
            'salary_terms_heading': 'Salary Terms:',
            'salary_terms_points': ['Active member = Team member with $50+ investment', 'Salary credited daily at 12:05 AM IST'],
            'key_points_title': 'Key Points to Remember',
            'key_points': ['Duration: 20 days per investment', 'Daily ROI: 12:00 AM IST automatic', 'Weekly Offer: Sunday & Wednesday 6-8 PM IST', 'Offer Bonus: 10% on $50+ deposits', 'Salary: 12:05 AM IST based on rank', 'Unlimited: Multiple investments allowed', 'Options: Withdraw or Recompound', 'Minimum: $1 withdrawal, 5% fee', 'Referral: 10 levels (L1-L5: 1%, L6-L10: 0.6%-0.2%)'],
            'start_now': 'Start Investing Today!',
            'thank_you': 'Thank You!',
            'thank_you_msg': 'Thank you for joining TradeGo! Start your investment journey today!'
        }


if __name__ == '__main__':
    # Create static folder if not exists
    os.makedirs('/app/backend/static', exist_ok=True)
    
    # Generate PDFs for all languages
    languages = ['en', 'hi', 'ur', 'es', 'fr', 'ar']
    lang_names = {'en': 'EN', 'hi': 'HI', 'ur': 'UR', 'es': 'ES', 'fr': 'FR', 'ar': 'AR'}
    
    for lang in languages:
        filename = f'/app/backend/static/TradeGo_Guide_{lang_names[lang]}.pdf'
        create_tradego_pdf(filename, lang)
    
    # Create default PDF (English)
    create_tradego_pdf('/app/backend/static/TradeGo_Guide.pdf', 'en')
    
    print("\nAll PDFs generated successfully!")
