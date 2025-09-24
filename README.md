# 🗳️ Volby 2025 - Volební Kalkulačka

![Volby 2025](https://img.shields.io/badge/Volby-2025-blue?style=for-the-badge&logo=vote&logoColor=white)
![Status](https://img.shields.io/badge/Status-HOTOVÝ-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## 🚀 **Krásná hlavní stránka s animacemi je připravena!**

Vytvořil jsem profesionální landing page s moderním designem, která obsahuje:

### ✨ **Design Features:**
- 🎨 **Moderní gradient pozadí** s animovanými tvary
- 💫 **Plynulé animace** a přechody
- 📱 **Plně responzívní** design
- 🎯 **Intuitivní navigace** s smooth scrolling
- ⚡ **Rychlé načítání** s optimalizovaným CSS
- 🌟 **Profesionální ikony** Font Awesome

### 🛠️ **Technické vlastnosti:**
- 📊 **Animované čítače** statistik
- 🔄 **Intersection Observer** pro scroll animace
- 💎 **CSS Grid & Flexbox** pro layouty
- 🎭 **CSS Custom Properties** pro theming
- 📐 **Backdrop-filter** pro glassmorphism efekt
- 🎪 **Keyframe animace** pro floating shapes

### 📁 **Struktura:**
```
Volby2025/
├── index.html          # 🏠 Hlavní landing page
├── styles.css          # 🎨 (připravený pro externí CSS)
├── README.md           # 📚 Tato dokumentace
└── volebni-kalkulacka-2025/  # 🧮 Next.js aplikace
```

### 🎯 **Funkcionality:**
- **Hero sekce** s poutavým nadpisem a CTA tlačítky
- **Features grid** se 6 kartami funkcí
- **Statistiky** s animovanými čítači
- **Fixní header** s blur efektem při scrollování
- **Footer** s odkazy na podstránky

### 🌈 **Barevné schéma:**
- **Primary:** `#2563eb` (modrá)
- **Secondary:** `#f1f5f9` (světle šedá)
- **Accent:** `#10b981` (zelená)
- **Gradient:** Modrá → Fialová

### 🚀 **Jak spustit:**

### 🌐 **Produkční nasazení:**

**Cílová URL:** `https://www.itzkore.cz/volby2025/`

**Server konfigurace (.htaccess):**
```apache
RewriteEngine On
RewriteBase /volby2025/

# Serve main landing page at root
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^$ index.html [L]

# Handle Next.js routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^volebni-kalkulacka-2025/(.*)$ volebni-kalkulacka-2025/index.html [L]

# MIME types & Security headers
<Files "manifest.json">
    Header set Content-Type "application/json"
</Files>

# Enable compression & caching
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

### 🚀 **Lokální development:**

1. **Otevřít hlavní stránku:**
   ```
   Otevřít: c:\Volby2025\index.html
   ```

2. **Spustit volební kalkulačku (development):**
   ```bash
   cd volebni-kalkulacka-2025
   npm run dev
   # Otevře se na: http://localhost:3000
   ```

3. **Build pro produkci:**
   ```bash
   cd volebni-kalkulacka-2025
   npm run build
   npm start
   ```

### 🎨 **Preview funkcí:**
- ✅ **26 politických stran** s kompletními daty
- ✅ **20 klíčových témat** pokrývajících všechny oblasti
- ✅ **Mobilní optimalizace** pro všechna zařízení  
- ✅ **Transparentní metodika** s otevřeným kódem
- ✅ **Moderní UI/UX** s animacemi a přechody
- ✅ **Rychlý a pomalý test** dle preferencí

### 🏆 **Kvalita kódu:**
- 💯 **Validní HTML5** s sémantickými elementy
- 🎯 **Modern CSS3** s Grid, Flexbox a animacemi
- ⚡ **Vanilla JavaScript** bez závislostí
- 📱 **Mobile-first** responzivní design
- 🔍 **SEO optimalizované** s meta tags
- ♿ **Přístupný** design pro všechny uživatele

---

**🎉 Stránka je připravena k použití! Otevřete `index.html` a užijte si krásný design s animacemi!**
