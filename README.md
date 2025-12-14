# 🎨 InstaGen - Fabric.js Canvas Editor

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff?logo=vite)
![Fabric.js](https://img.shields.io/badge/Fabric.js-5.3.0-f1672f)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-3.3.6-38b2ac?logo=tailwind-css)

A professional **React-based canvas editor** with **Fabric.js**, featuring dark mode support, social safe zones, and high-quality image export. Perfect for creating Instagram Stories, Reels, and social media content.

## ✨ Key Features

### 🎨 Canvas Tools
- ✏️ **Text Editor** - Add and edit text with live preview
- ▭ **Rectangle Tool** - Draw rectangles with custom colors
- ● **Circle Tool** - Create circles and adjust size
- 🗑️ **Delete & Clear** - Remove individual objects or clear entire canvas

### 🌓 Dark Mode
- 🌙 **Toggle Switch** - Easy dark/light mode switching
- 💾 **Persistent** - Saves preference in localStorage
- 🎨 **Adaptive Colors** - All UI elements respond to theme

### 📱 Social Safe Zones
- **9x16 Format (1080x1920)** - Instagram Stories/Reels compliance
- **200px Top + 250px Bottom** - Safe zone indicators
- **1470px Safe Area** - Center content zone

### 📥 Export & Download
- 📸 **PNG/JPEG Export** - Multiple formats
- 📐 **Size Presets**: Story (1080×1920), Square (1080×1080), Preview (500×500)
- 💡 **Professional Output** - Always exports with optimal background

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Sanskar-2004/InstaGen.git
cd InstaGen

# 2. Install dependencies
cd frontend
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:3002
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
InstaGen/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CanvasEditor.jsx          # Main canvas component
│   │   │   ├── DarkModeToggle.jsx        # Theme switcher
│   │   │   └── layout/
│   │   │       ├── EditorLayout.jsx
│   │   │       ├── LeftSidebar.jsx
│   │   │       └── RightSidebar.jsx
│   │   ├── hooks/useDarkMode.js
│   │   ├── utils/updateCanvasTheme.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── README.md
└── SOURCE_CODE_COMPLETE.md
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI Framework |
| **Vite** | 5.0 | Build Tool |
| **Fabric.js** | 5.3.0 | Canvas Library |
| **Tailwind CSS** | 3.3.6 | Styling |
| **Lucide React** | 0.561.0 | Icons |

---

## 💡 Usage

### Adding Text
1. Click **+ Text** button
2. Text appears on canvas
3. Double-click to edit

### Drawing Shapes
1. Click **+ Rect** or **+ Circle**
2. Shape appears with colors that adapt to dark mode

### Safe Zones
1. Click **🎯 Safe Zones ON/OFF**
2. Red overlays show unsafe areas
3. Perfect for Instagram Stories

### Exporting
1. Open **Export** panel
2. Choose format & size
3. Click **Download Design ⬇**

### Dark Mode
1. Click **🌙 Dark** or **☀️ Light** button
2. Entire UI adapts
3. Preference saves automatically

---

## 📱 Social Safe Zones

For Instagram Stories/Reels (9:16):
```
┌─────────────────────────────────┐
│  ⚠️  200px - UNSAFE TOP         │ (Red overlay)
├─────────────────────────────────┤
│                                 │
│      ✅ 1470px - SAFE AREA      │
│                                 │
├─────────────────────────────────┤
│  ⚠️  250px - UNSAFE BOTTOM      │ (Red overlay)
└─────────────────────────────────┘
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Canvas not visible | Toggle dark mode or refresh (Ctrl+R) |
| Port 3002 in use | Kill the process or use different port |
| Dependencies not installed | Run `npm install` in frontend folder |
| Dark mode not saving | Check if localStorage is enabled |

---

## 📚 Documentation

- **[Full Source Code](./SOURCE_CODE_COMPLETE.md)** - Complete documentation
- **[GitHub Upload Guide](./GITHUB_UPLOAD_GUIDE.md)** - Deployment guide

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - You are free to use, modify, and distribute.

---

## 📊 Project Stats

![GitHub Repo Size](https://img.shields.io/github/repo-size/Sanskar-2004/InstaGen)
![GitHub License](https://img.shields.io/github/license/Sanskar-2004/InstaGen)
![Last Commit](https://img.shields.io/github/last-commit/Sanskar-2004/InstaGen/main)

---

## 📞 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/Sanskar-2004/InstaGen/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Sanskar-2004/InstaGen/discussions)
- 👤 **Author**: [Sanskar-2004](https://github.com/Sanskar-2004)

---

## 🎯 Getting Help

**Something not working?**

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search [existing issues](https://github.com/Sanskar-2004/InstaGen/issues)
3. Read the [Full Documentation](./SOURCE_CODE_COMPLETE.md)
4. [Create a new issue](https://github.com/Sanskar-2004/InstaGen/issues/new)

---

**Made with ❤️ by [Sanskar-2004](https://github.com/Sanskar-2004)**

**Last Updated**: December 15, 2025 | **Version**: 1.0.0 | **Repository**: [InstaGen](https://github.com/Sanskar-2004/InstaGen)

[⬆ Back to Top](#-instagen---fabricjs-canvas-editor)
