#!/usr/bin/env python3
"""
TradeGo - COLORFUL Luxury Roadmap PDF
With proper image embedding
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
import os

# Colors
PURPLE_DARK = HexColor('#1A0033')
GOLD = HexColor('#FFD700')
WHITE = HexColor('#FFFFFF')
CYAN = HexColor('#00FFFF')
GREEN = HexColor('#00FF88')
PINK = HexColor('#FF00FF')
YELLOW = HexColor('#FFFF00')

# Image directory
IMG_DIR = "/app/backend/roadmap_images"

class ColorfulPDF:
    def __init__(self, filename):
        self.filename = filename
        self.w, self.h = A4
        self.c = canvas.Canvas(filename, pagesize=A4)
        
    def get_image(self, name):
        """Get full image path"""
        path = os.path.join(IMG_DIR, name)
        if os.path.exists(path):
            return path
        print(f"WARNING: Image not found: {path}")
        return None
        
    def gradient_bg(self):
        """Purple-blue gradient"""
        for i in range(100):
            ratio = i / 100
            r = 0.1 + ratio * 0.05
            g = 0.0 + ratio * 0.02
            b = 0.2 + ratio * 0.3
            self.c.setFillColorRGB(r, g, b)
            y = i * (self.h / 100)
            self.c.rect(0, self.h - y - (self.h/100), self.w, self.h/100 + 1, fill=True, stroke=False)
    
    def neon_line(self, y, color=CYAN):
        self.c.setStrokeColor(color)
        self.c.setLineWidth(2)
        self.c.line(40, y, self.w - 40, y)
        
    def logo(self, y=None):
        if y is None:
            y = self.h - 60
        self.c.setFillColor(GOLD)
        self.c.setFont("Helvetica-Bold", 22)
        self.c.drawCentredString(self.w/2, y, "TRADEGO")
        self.c.setFillColor(CYAN)
        self.c.setFont("Helvetica", 10)
        self.c.drawCentredString(self.w/2, y - 14, "Smart Trading, Smart Earning")
        
    def page1_cover(self):
        """Cover with road background"""
        # First draw gradient as fallback
        self.gradient_bg()
        
        # Then draw image on top
        img_path = self.get_image('cover_road.jpg')
        if img_path:
            print(f"Drawing cover image: {img_path}")
            self.c.drawImage(img_path, 0, 0, width=self.w, height=self.h)
        else:
            print("Cover image not found, using gradient only")
        
        # Semi-transparent overlay for text
        self.c.setFillColorRGB(0.05, 0, 0.1, 0.5)
        self.c.rect(0, self.h/2 - 80, self.w, 200, fill=True, stroke=False)
        
        # Neon border
        self.c.setStrokeColor(GOLD)
        self.c.setLineWidth(3)
        self.c.rect(15, 15, self.w - 30, self.h - 30, stroke=True, fill=False)
        
        # Title
        self.c.setFillColor(GOLD)
        self.c.setFont("Helvetica-Bold", 44)
        self.c.drawCentredString(self.w/2, self.h/2 + 70, "TRADEGO")
        
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica-Bold", 22)
        self.c.drawCentredString(self.w/2, self.h/2 + 30, "PROJECT ROADMAP")
        
        self.c.setFillColor(CYAN)
        self.c.setFont("Helvetica-Bold", 20)
        self.c.drawCentredString(self.w/2, self.h/2 - 10, "2025 — 2030")
        
        # Circles
        self.c.setStrokeColor(GOLD)
        self.c.setLineWidth(2)
        self.c.circle(self.w/2, self.h/2 + 30, 90, stroke=True, fill=False)
        
        # Footer
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica", 10)
        self.c.drawCentredString(self.w/2, 50, "Powered by Binance Smart Chain")
        self.c.setFillColor(YELLOW)
        self.c.setFont("Helvetica-Bold", 11)
        self.c.drawCentredString(self.w/2, 35, "ENGLISH")
        
        self.c.showPage()
        
    def page2_mission(self):
        self.gradient_bg()
        self.neon_line(self.h - 25)
        self.neon_line(25)
        self.logo()
        
        # Mission image
        img_path = self.get_image('mission_color.jpg')
        if img_path:
            iw, ih = 280, 280
            ix = (self.w - iw) / 2
            iy = self.h/2 + 30
            self.c.drawImage(img_path, ix, iy, width=iw, height=ih)
        
        self.c.setFillColor(GOLD)
        self.c.setFont("Helvetica-Bold", 32)
        self.c.drawCentredString(self.w/2, self.h/2 - 10, "MISSION")
        
        self.c.setStrokeColor(CYAN)
        self.c.setLineWidth(3)
        self.c.line(self.w/2 - 60, self.h/2 - 25, self.w/2 + 60, self.h/2 - 25)
        
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica", 11)
        lines = [
            "To empower investors worldwide with intelligent",
            "trading solutions, daily passive income opportunities,",
            "and a revolutionary multi-level referral system."
        ]
        y = self.h/2 - 55
        for line in lines:
            self.c.drawCentredString(self.w/2, y, line)
            y -= 16
            
        self.c.showPage()
        
    def page3_vision(self):
        self.gradient_bg()
        self.neon_line(self.h - 25)
        self.neon_line(25)
        self.logo()
        
        img_path = self.get_image('vision_color.jpg')
        if img_path:
            iw, ih = 300, 260
            ix = (self.w - iw) / 2
            iy = self.h/2 + 40
            self.c.drawImage(img_path, ix, iy, width=iw, height=ih)
        
        self.c.setFillColor(GOLD)
        self.c.setFont("Helvetica-Bold", 32)
        self.c.drawCentredString(self.w/2, self.h/2 - 5, "VISION")
        
        self.c.setStrokeColor(PINK)
        self.c.setLineWidth(3)
        self.c.line(self.w/2 - 50, self.h/2 - 20, self.w/2 + 50, self.h/2 - 20)
        
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica", 11)
        lines = [
            "To build a sustainable financial network where",
            "investors thrive through automated ROI systems,",
            "multi-level team income, and crypto integration."
        ]
        y = self.h/2 - 50
        for line in lines:
            self.c.drawCentredString(self.w/2, y, line)
            y -= 16
            
        self.c.showPage()
        
    def year_page(self, year, title, quarters, img_name=None, accent=CYAN):
        self.gradient_bg()
        self.neon_line(self.h - 25, accent)
        self.neon_line(25, accent)
        self.logo()
        
        # Year badge
        self.c.setFillColor(accent)
        self.c.roundRect(self.w/2 - 50, self.h - 140, 100, 35, 8, fill=True, stroke=False)
        self.c.setFillColor(PURPLE_DARK)
        self.c.setFont("Helvetica-Bold", 17)
        self.c.drawCentredString(self.w/2, self.h - 130, str(year))
        
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica-Bold", 18)
        self.c.drawCentredString(self.w/2, self.h - 170, title)
        
        # Image on right
        if img_name:
            img_path = self.get_image(img_name)
            if img_path:
                iw, ih = 170, 200
                ix = self.w - iw - 25
                iy = self.h - 420
                self.c.drawImage(img_path, ix, iy, width=iw, height=ih)
        
        y = self.h - 205
        max_chars = 42 if img_name else 60
        
        for qtr, items in quarters:
            self.c.setFillColor(accent)
            self.c.setFont("Helvetica-Bold", 12)
            self.c.drawString(45, y, qtr)
            y -= 18
            
            self.c.setFillColor(WHITE)
            self.c.setFont("Helvetica", 10)
            for item in items:
                self.c.setFillColor(GREEN)
                self.c.circle(53, y + 3, 3, fill=True, stroke=False)
                self.c.setFillColor(WHITE)
                
                if len(item) > max_chars:
                    self.c.drawString(63, y, item[:max_chars])
                    y -= 12
                    self.c.drawString(63, y, item[max_chars:])
                else:
                    self.c.drawString(63, y, item)
                y -= 14
            y -= 8
            
        self.c.showPage()
        
    def page4_2025(self):
        quarters = [
            ("Q3 2025 (Aug-Sept)", [
                "Official platform launch with smart contracts",
                "Launch of Investment Slabs (1-6) with daily ROI",
                "USDT deposits via TRC20 network integration",
                "5-level referral commission system launch"
            ]),
            ("Q4 2025 (Oct-Dec)", [
                "Mobile-responsive web application release",
                "Daily salary distribution system activation",
                "Advanced admin dashboard for management",
                "Multi-language PDF generation",
                "Community campaigns across Asian markets"
            ])
        ]
        self.year_page(2025, "Foundation & Launch", quarters, 'rocket_color.jpg', CYAN)
        
    def page5_2026(self):
        quarters = [
            ("Q1-Q2 2026", [
                "Launch of Forex Trading simulation",
                "Binance API integration for live prices",
                "Advanced charting with multiple timeframes",
                "Bot trading indicators integration",
                "Community expansion across Asia & Europe"
            ]),
            ("Q3-Q4 2026", [
                "Mobile app release for iOS and Android",
                "Additional payment gateway integration",
                "Premium VIP membership tiers launch",
                "Advanced analytics dashboard",
                "Partnership with crypto influencers"
            ])
        ]
        self.year_page(2026, "Ecosystem Expansion", quarters, 'tree_color.jpg', GREEN)
        
    def page6_2027(self):
        quarters = [
            ("Q1-Q2 2027", [
                "DeFi savings and lending programs",
                "Expansion into American & European markets",
                "TradeGo Academy launch (education)",
                "Integration with major banking systems"
            ]),
            ("Q3-Q4 2027", [
                "Global partnerships with fintech leaders",
                "2nd Anniversary: Target 100,000+ users",
                "Automated copy-trading feature launch",
                "NFT rewards for top performers"
            ])
        ]
        self.year_page(2027, "Real-World Adoption", quarters, None, PINK)
        
    def page7_2028(self):
        quarters = [
            ("Q1-Q2 2028", [
                "Tier-1 Exchange listing applications",
                "Binance, Gate.io, KuCoin, OKX integration",
                "TradeGo governance token launch",
                "Staking rewards program introduction"
            ]),
            ("Q3-Q4 2028", [
                "Global Merchant Alliance network launch",
                "International crypto rebranding campaign",
                "E-commerce platform partnerships",
                "Target: 500,000+ registered users"
            ])
        ]
        self.year_page(2028, "Growth & Recognition", quarters, None, GOLD)
        
    def page8_2029(self):
        quarters = [
            ("Full Year 2029", [
                "Official Binance listing achievement",
                "Global education and adoption programs",
                "Target: 1 million active users",
                "Solidification as global crypto brand",
                "Institutional investment products",
                "Real-time live market trading"
            ])
        ]
        self.year_page(2029, "Global Integration", quarters, None, CYAN)
        
    def page9_beyond(self):
        self.gradient_bg()
        self.neon_line(self.h - 25, GOLD)
        self.neon_line(25, GOLD)
        self.logo()
        
        img_path = self.get_image('trophy_color.jpg')
        if img_path:
            iw, ih = 200, 230
            ix = self.w - iw - 25
            iy = self.h/2 - 80
            self.c.drawImage(img_path, ix, iy, width=iw, height=ih)
        
        self.c.setFillColor(GOLD)
        self.c.setFont("Helvetica-Bold", 28)
        self.c.drawString(45, self.h - 130, "Beyond 2030")
        
        self.c.setFillColor(CYAN)
        self.c.setFont("Helvetica-Bold", 16)
        self.c.drawString(45, self.h - 158, "Sustainable Growth")
        
        items = [
            "Continuous innovation in trading technology",
            "Expansion to 200+ countries worldwide",
            "Target: 10 million active investors",
            "Full integration with global banking",
            "TradeGo Debit Card launch",
            "TradeGo Foundation establishment",
            "Platform stability commitment",
            "Continuous ecosystem upgrades"
        ]
        
        y = self.h - 200
        self.c.setFont("Helvetica", 11)
        for item in items:
            self.c.setFillColor(YELLOW)
            self.c.circle(55, y + 4, 4, fill=True, stroke=False)
            self.c.setFillColor(WHITE)
            self.c.drawString(68, y, item)
            y -= 26
            
        self.c.showPage()
        
    def page10_contact(self):
        self.gradient_bg()
        
        self.c.setStrokeColor(CYAN)
        self.c.setLineWidth(3)
        self.c.rect(25, 25, self.w - 50, self.h - 50, stroke=True, fill=False)
        
        self.c.setFillColor(GOLD)
        self.c.setFont("Helvetica-Bold", 46)
        self.c.drawCentredString(self.w/2, self.h/2 + 90, "TRADEGO")
        
        self.c.setFillColor(CYAN)
        self.c.setFont("Helvetica", 16)
        self.c.drawCentredString(self.w/2, self.h/2 + 55, "Smart Trading, Smart Earning")
        
        self.c.setStrokeColor(PINK)
        self.c.setLineWidth(4)
        self.c.line(self.w/2 - 120, self.h/2 + 25, self.w/2 + 120, self.h/2 + 25)
        
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica-Bold", 20)
        self.c.drawCentredString(self.w/2, self.h/2 - 20, "Join the Revolution")
        
        self.c.setFillColor(YELLOW)
        self.c.setFont("Helvetica-Bold", 15)
        self.c.drawCentredString(self.w/2, self.h/2 - 55, "www.tradegenius.io")
        
        self.c.setFillColor(WHITE)
        self.c.setFont("Helvetica", 9)
        self.c.drawCentredString(self.w/2, 45, "© 2025 TradeGo. All Rights Reserved.")
        
        self.c.showPage()
        
    def generate(self):
        print("🎨 Generating COLORFUL PDF with Images...")
        print(f"Image directory: {IMG_DIR}")
        print(f"Available images: {os.listdir(IMG_DIR)}")
        
        self.page1_cover()
        self.page2_mission()
        self.page3_vision()
        self.page4_2025()
        self.page5_2026()
        self.page6_2027()
        self.page7_2028()
        self.page8_2029()
        self.page9_beyond()
        self.page10_contact()
        
        self.c.save()
        size_mb = os.path.getsize(self.filename) / 1024 / 1024
        print(f"✅ PDF saved: {self.filename}")
        print(f"   Size: {size_mb:.2f} MB")

if __name__ == "__main__":
    pdf = ColorfulPDF("/app/frontend/public/Trade_Genius_Roadmap_2025-2030.pdf")
    pdf.generate()
