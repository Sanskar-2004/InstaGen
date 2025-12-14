# InstaGen - Frontend

A modern React.js application built with Vite for creating Instagram content with a canvas editor powered by Fabric.js.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── CanvasEditor.jsx       # Main canvas editor with Fabric.js
│   │   └── layout/
│   │       ├── EditorLayout.jsx   # Three-panel layout wrapper
│   │       ├── LeftSidebar.jsx    # Assets & color palettes panel
│   │       └── RightSidebar.jsx   # Properties & export settings
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind CSS & custom styles
├── public/                         # Static assets
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
└── postcss.config.js               # PostCSS config
```

## Features

### CanvasEditor Component
- **Fabric.js Integration**: Full canvas manipulation with shapes, text, and drawing
- **Toolbar**: Select, Text, Rectangle, Circle, Draw tools
- **Canvas Operations**: Delete objects, clear canvas, download as PNG
- **Smart Canvas Sizing**: Default 1080x1080 (Instagram post size)

### Three-Panel Layout
1. **Left Sidebar (Assets)**
   - Upload and manage image assets
   - Pre-built color palettes (Sunrise, Ocean, Forest)
   - Drag-and-drop support
   - Tabs for quick switching

2. **Center (Canvas Editor)**
   - Full-featured drawing canvas
   - Real-time object manipulation
   - Responsive toolbar
   - Multiple export options

3. **Right Sidebar (Properties & Export)**
   - **Properties Tab**: Color picker, font size, opacity, alignment controls
   - **Export Tab**: Format selection, dimension presets, compliance checks
   - Instagram-optimized dimensions
   - Quality export settings

## Dependencies

- **React 18**: UI library
- **Fabric.js**: Canvas manipulation library
- **Axios**: HTTP client for API calls
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next-generation build tool

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### API Integration

The frontend is configured to proxy API requests to `http://localhost:8000`:
- Backend API calls: `/api/palettes`, `/api/layouts`
- Make requests using axios: `axios.get('/api/palettes')`

## Canvas Editor Usage

### Tools
- **Select**: Click to select objects, drag to move
- **Text**: Add editable text to canvas
- **Rectangle**: Draw rectangular shapes
- **Circle**: Draw circular shapes
- **Delete**: Remove selected object
- **Clear**: Clear entire canvas
- **Download**: Export canvas as PNG

### Customization
- Change fill colors using the color picker
- Adjust font size with the range slider
- Control opacity from 0-100%
- Align objects using alignment buttons
- Export in multiple formats (PNG, JPG, SVG, PDF)

## Keyboard Shortcuts (Coming Soon)
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `Delete`: Delete selected object
- `Ctrl+A`: Select all
- `Ctrl+S`: Save draft

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## Performance Optimization

- Code splitting for components
- Lazy loading of assets
- Optimized Tailwind CSS purging
- Canvas rendering optimization
- Memory management for canvas objects

## Future Enhancements

- [ ] History/Undo-Redo system
- [ ] Layer management
- [ ] Advanced filters
- [ ] Template library
- [ ] Collaborative editing
- [ ] AI-powered suggestions
- [ ] Real-time collaboration

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

MIT
