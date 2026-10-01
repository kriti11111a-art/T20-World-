"""
TradeGo Professional PDF Generator
Similar style to BNB ROCKET presentation
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Colors
DARK_BG = HexColor('#0A0A0A')
GREEN_ACCENT = HexColor('#10B981')
GOLD_ACCENT = HexColor('#FFD700')
TEAL_ACCENT = HexColor('#0D9488')
WHITE = white
GREY_TEXT = HexColor('#9CA3AF')

def draw_gradient_bg(c, width, height):
    """Draw dark gradient background"""
    c.setFillColor(DARK_BG)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Add subtle gradient overlay
    c.setFillColor(HexColor('#111111'))
    c.rect(0, height * 0.6, width, height * 0.4, fill=1, stroke=0)

def draw_glow_circle(c, x, y, radius, color):
    """Draw glowing circle effect"""
    c.setFillColor(color)
    c.circle(x, y, radius, fill=1, stroke=0)

def create_title_page(c, width, height):
    """Page 1: Welcome Title Page"""
    draw_gradient_bg(c, width, height)
    
    # Glow effects
    c.setFillAlpha(0.1)
    draw_glow_circle(c, 100, height - 100, 150, GREEN_ACCENT)
    draw_glow_circle(c, width - 100, 150, 200, TEAL_ACCENT)
    c.setFillAlpha(1)
    
    # Main Title
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 48)
    c.drawCentredString(width/2, height - 250, "TRADEGO")
    
    # Subtitle
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica", 24)
    c.drawCentredString(width/2, height - 300, "INVESTMENT PLATFORM")
    
    # Tagline
    c.setFillColor(GREY_TEXT)
    c.setFont("Helvetica", 16)
    c.drawCentredString(width/2, height - 350, "Smart Investing • Daily Returns • Build Your Team")
    
    # Logo placeholder box
    c.setStrokeColor(GREEN_ACCENT)
    c.setLineWidth(2)
    c.roundRect(width/2 - 60, height/2 - 30, 120, 120, 20, stroke=1, fill=0)
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height/2 + 20, "TG")
    
    # Website
    c.setFillColor(GOLD_ACCENT)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width/2, 150, "www.tradego.io")
    
    # Footer
    c.setFillColor(GREY_TEXT)
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, 80, "BUSINESS PLAN PRESENTATION")

def create_intro_page(c, width, height):
    """Page 2: Introduction"""
    draw_gradient_bg(c, width, height)
    
    # Title
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 100, "INTRODUCTION")
    
    # Green line
    c.setStrokeColor(GREEN_ACCENT)
    c.setLineWidth(3)
    c.line(width/2 - 100, height - 120, width/2 + 100, height - 120)
    
    # Content
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 14)
    
    intro_text = [
        "TradeGo is a modern investment platform designed to help",
        "users grow their wealth through smart investment strategies.",
        "",
        "Built with cutting-edge technology, TradeGo offers:",
        "",
        "• Daily ROI on your investments (5.5% daily for 20 days)",
        "• 10-Level referral income system",
        "• Transparent and secure transactions",
        "• Professional salary rank rewards",
        "• Easy-to-use mobile interface",
        "",
        "Our platform combines the power of smart investment models",
        "with a robust referral structure to maximize your earnings."
    ]
    
    y = height - 200
    for line in intro_text:
        if line.startswith("•"):
            c.setFillColor(GREEN_ACCENT)
        else:
            c.setFillColor(WHITE)
        c.drawCentredString(width/2, y, line)
        y -= 30

def create_investment_slabs_page(c, width, height):
    """Page 3: Investment Slabs"""
    draw_gradient_bg(c, width, height)
    
    # Title
    c.setFillColor(GOLD_ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 80, "INVESTMENT SLABS")
    
    # Subtitle
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 115, "5.5% Daily ROI • 20 Days Duration • 110% Total Return")
    
    # Investment Plans Table
    slabs = [
        ("SLAB 1", "$1 - $19", "5.5%", "$0.055 - $1.045", "$1.10 - $20.90"),
        ("SLAB 2", "$20 - $299", "5.5%", "$1.10 - $16.45", "$22 - $328.90"),
        ("SLAB 3", "$300 - $999", "5.5%", "$16.50 - $54.95", "$330 - $1098.90"),
        ("SLAB 4", "$1000+", "5.5%", "$55+", "$1100+"),
    ]
    
    # Table headers
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 12)
    headers = ["PLAN", "AMOUNT", "DAILY ROI", "DAILY EARNING", "TOTAL RETURN"]
    x_positions = [80, 160, 260, 360, 480]
    y = height - 180
    
    for i, header in enumerate(headers):
        c.drawString(x_positions[i], y, header)
    
    # Table rows
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 11)
    y -= 40
    
    for slab in slabs:
        for i, value in enumerate(slab):
            if i == 0:
                c.setFillColor(GOLD_ACCENT)
            else:
                c.setFillColor(WHITE)
            c.drawString(x_positions[i], y, value)
        y -= 35
    
    # First Deposit Info
    y -= 30
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, y, "FIRST DEPOSIT BONUS")
    
    y -= 30
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 12)
    c.drawCentredString(width/2, y, "• New users receive $2 Welcome Bonus")
    y -= 25
    c.drawCentredString(width/2, y, "• First deposit minimum: $3")
    y -= 25
    c.drawCentredString(width/2, y, "• $3 deposit + $2 bonus = $5 Investment Slab Auto-Created")
    y -= 25
    c.drawCentredString(width/2, y, "• After first deposit: minimum $1")

def create_level_income_page(c, width, height):
    """Page 4: 10-Level Referral Income"""
    draw_gradient_bg(c, width, height)
    
    # Title
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 80, "10-LEVEL INCOME")
    
    # Subtitle
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 115, "Earn from 10 levels of your referral network")
    
    # Level Income Table
    levels = [
        ("Level 1", "10%", "$50+ Active"),
        ("Level 2", "3%", "$50+ Active"),
        ("Level 3", "2%", "$50+ Active"),
        ("Level 4", "1%", "$100+ Active"),
        ("Level 5", "1%", "$100+ Active"),
        ("Level 6", "0.5%", "$200+ Active"),
        ("Level 7", "0.5%", "$200+ Active"),
        ("Level 8", "0.5%", "$200+ Active"),
        ("Level 9", "0.5%", "$200+ Active"),
        ("Level 10", "0.5%", "$200+ Active"),
    ]
    
    # Headers
    c.setFillColor(GOLD_ACCENT)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(120, height - 170, "LEVEL")
    c.drawString(250, height - 170, "COMMISSION")
    c.drawString(400, height - 170, "REQUIREMENT")
    
    # Rows
    y = height - 210
    c.setFont("Helvetica", 11)
    
    for level, commission, requirement in levels:
        c.setFillColor(GREEN_ACCENT)
        c.drawString(120, y, level)
        c.setFillColor(GOLD_ACCENT)
        c.drawString(250, y, commission)
        c.setFillColor(GREY_TEXT)
        c.drawString(400, y, requirement)
        y -= 30
    
    # Eligibility Info
    y -= 20
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width/2, y, "LEVEL ELIGIBILITY CONDITIONS")
    
    y -= 30
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 11)
    c.drawCentredString(width/2, y, "$50+ wallet balance = 3 levels eligible")
    y -= 20
    c.drawCentredString(width/2, y, "$100+ wallet balance = 5 levels eligible")
    y -= 20
    c.drawCentredString(width/2, y, "$200+ wallet balance = 10 levels eligible")

def create_salary_ranks_page(c, width, height):
    """Page 5: Salary Ranks"""
    draw_gradient_bg(c, width, height)
    
    # Title
    c.setFillColor(GOLD_ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 80, "SALARY RANKS")
    
    # Subtitle
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 115, "Achieve ranks based on Self Investment, Power Leg & Weaker Leg")
    
    # Ranks Table
    ranks = [
        ("Bronze", "$50", "$500", "$500", "$30", "-"),
        ("Silver", "$100", "$1,500", "$1,500", "$60", "-"),
        ("Gold", "$150", "$3,500", "$3,500", "$110", "-"),
        ("Platinum", "$200", "$7,500", "$7,500", "$200", "-"),
        ("Diamond", "$500", "$15,000", "$15,000", "$200", "$15/day"),
        ("Crown", "$1,000", "$35,000", "$35,000", "$500", "$35/day"),
    ]
    
    # Headers
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 10)
    headers = ["RANK", "SELF", "POWER LEG", "WEAKER LEG", "REWARD", "SALARY"]
    x_pos = [50, 150, 230, 330, 430, 510]
    y = height - 170
    
    for i, header in enumerate(headers):
        c.drawString(x_pos[i], y, header)
    
    # Rows
    c.setFont("Helvetica", 10)
    y -= 35
    
    for rank in ranks:
        for i, value in enumerate(rank):
            if i == 0:
                c.setFillColor(GOLD_ACCENT)
            elif i == 4 or i == 5:
                c.setFillColor(GREEN_ACCENT)
            else:
                c.setFillColor(WHITE)
            c.drawString(x_pos[i], y, value)
        y -= 35
    
    # Note
    y -= 20
    c.setFillColor(GREY_TEXT)
    c.setFont("Helvetica", 11)
    c.drawCentredString(width/2, y, "Only USDT deposits count. Re-compounding not included.")
    
    y -= 30
    c.setFillColor(WHITE)
    c.drawCentredString(width/2, y, "Power Leg = Strongest direct referral's team")
    y -= 20
    c.drawCentredString(width/2, y, "Weaker Leg = Sum of all other referral teams")

def create_how_it_works_page(c, width, height):
    """Page 6: How It Works"""
    draw_gradient_bg(c, width, height)
    
    # Title
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 80, "HOW IT WORKS")
    
    steps = [
        ("1", "REGISTER", "Create your account with email and password"),
        ("2", "DEPOSIT", "Deposit USDT (BEP-20) to your wallet"),
        ("3", "INVEST", "Choose your investment slab ($1 - $1000+)"),
        ("4", "EARN DAILY", "Receive 5.5% daily ROI for 20 days"),
        ("5", "REFER & EARN", "Build your team and earn 10-level commission"),
        ("6", "WITHDRAW", "Withdraw anytime to your wallet"),
    ]
    
    y = height - 160
    
    for num, title, desc in steps:
        # Step number circle
        c.setFillColor(GREEN_ACCENT)
        c.circle(100, y, 20, fill=1, stroke=0)
        c.setFillColor(DARK_BG)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(100, y - 6, num)
        
        # Title
        c.setFillColor(GOLD_ACCENT)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(140, y, title)
        
        # Description
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 12)
        c.drawString(140, y - 22, desc)
        
        y -= 70

def create_terms_page(c, width, height):
    """Page 7: Terms & Conditions"""
    draw_gradient_bg(c, width, height)
    
    # Title
    c.setFillColor(GOLD_ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 80, "TERMS & CONDITIONS")
    
    terms = [
        "• Minimum first deposit: $3 (combined with $2 welcome bonus)",
        "• Minimum subsequent deposit: $1",
        "• Minimum withdrawal: $10",
        "• Withdrawal fee: 5%",
        "• Daily ROI: 5.5% for 20 days (110% total)",
        "• Investment duration: 20 days",
        "• Deposits accepted: USDT (BEP-20)",
        "• 10-Level referral income structure",
        "• Salary rank rewards based on team performance",
        "• Only direct USDT deposits count for rank eligibility",
        "• Re-compounding does not count for rank calculation",
    ]
    
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 12)
    
    y = height - 160
    for term in terms:
        if term.startswith("•"):
            c.setFillColor(GREEN_ACCENT)
            c.drawString(80, y, "•")
            c.setFillColor(WHITE)
            c.drawString(100, y, term[2:])
        else:
            c.drawString(80, y, term)
        y -= 30

def create_thank_you_page(c, width, height):
    """Page 8: Thank You"""
    draw_gradient_bg(c, width, height)
    
    # Glow effects
    c.setFillAlpha(0.1)
    draw_glow_circle(c, width/2, height/2, 200, GREEN_ACCENT)
    c.setFillAlpha(1)
    
    # Thank you text
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 48)
    c.drawCentredString(width/2, height/2 + 50, "THANK YOU")
    
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 24)
    c.drawCentredString(width/2, height/2, "For Your Attention")
    
    # Website
    c.setFillColor(GOLD_ACCENT)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, height/2 - 80, "www.tradego.io")
    
    # Contact info
    c.setFillColor(GREY_TEXT)
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, 150, "Start Your Investment Journey Today!")
    
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width/2, 100, "JOIN TRADEGO NOW")

def generate_trade_genius_pdf(output_path):
    """Generate the complete TradeGo PDF"""
    width, height = A4
    c = canvas.Canvas(output_path, pagesize=A4)
    
    # Page 1: Title
    create_title_page(c, width, height)
    c.showPage()
    
    # Page 2: Introduction
    create_intro_page(c, width, height)
    c.showPage()
    
    # Page 3: Investment Slabs
    create_investment_slabs_page(c, width, height)
    c.showPage()
    
    # Page 4: Level Income
    create_level_income_page(c, width, height)
    c.showPage()
    
    # Page 5: Salary Ranks
    create_salary_ranks_page(c, width, height)
    c.showPage()
    
    # Page 6: How It Works
    create_how_it_works_page(c, width, height)
    c.showPage()
    
    # Page 7: Terms
    create_terms_page(c, width, height)
    c.showPage()
    
    # Page 8: Thank You
    create_thank_you_page(c, width, height)
    
    c.save()
    print(f"PDF generated: {output_path}")
    return output_path

if __name__ == "__main__":
    output_file = "/app/backend/Trade_Genius_Business_Plan.pdf"
    generate_trade_genius_pdf(output_file)
