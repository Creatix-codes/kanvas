/* ============================================================
   KANVAS — docs content (source of truth for #/docs)
   ============================================================ */
window.DOCS = (function () {
  'use strict';

  var nav = [
    { id: 'cat-getting-started', label: 'Getting Started', items: [
      { id: 'getting-started', label: 'Introduction' }
    ]},
    { id: 'cat-tools', label: 'Tools', items: [
      { id: 'tools', label: 'All Tools' },
      { id: 'try-it', label: 'Try It Live' },
      { id: 'drawing', label: 'Drawing' }
    ]},
    { id: 'cat-canvas', label: 'Canvas', items: [
      { id: 'zoom', label: 'Zoom & Navigation' }
    ]},
    { id: 'cat-editing', label: 'Editing', items: [
      { id: 'undo-redo', label: 'Undo & Redo' }
    ]},
    { id: 'cat-styling', label: 'Styling', items: [
      { id: 'styling', label: 'Style Controls' },
      { id: 'themes', label: 'Light & Dark Mode' }
    ]},
    { id: 'cat-export', label: 'Export', items: [
      { id: 'export', label: 'Export Options' }
    ]},
    { id: 'cat-reference', label: 'Reference', items: [
      { id: 'shortcuts', label: 'Keyboard Shortcuts' },
      { id: 'tips', label: 'Tips' },
      { id: 'examples', label: 'Examples' },
      { id: 'faq', label: 'FAQ' }
    ]}
  ];

  var toc = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'tools', label: 'Tools' },
    { id: 'drawing', label: 'Drawing' },
    { id: 'zoom', label: 'Zoom & Navigation' },
    { id: 'undo-redo', label: 'Undo & Redo' },
    { id: 'styling', label: 'Color & Styling' },
    { id: 'themes', label: 'Light & Dark Mode' },
    { id: 'export', label: 'Export' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts' },
    { id: 'tips', label: 'Tips' },
    { id: 'examples', label: 'Examples' },
    { id: 'faq', label: 'FAQ' }
  ];

  var tools = [
    { icon: 'cursor', name: 'Select', key: 'V', desc: 'Select and move objects' },
    { icon: 'hand', name: 'Pan', key: 'H', desc: 'Pan the canvas' },
    { icon: 'square', name: 'Rectangle', key: 'R', desc: 'Draw a rectangle' },
    { icon: 'circle', name: 'Ellipse', key: 'O', desc: 'Draw an ellipse' },
    { icon: 'diamond', name: 'Diamond', key: 'D', desc: 'Draw a diamond' },
    { icon: 'arrow-up-right', name: 'Arrow', key: 'A', desc: 'Draw an arrow' },
    { icon: 'minus', name: 'Line', key: 'L', desc: 'Draw a straight line' },
    { icon: 'pencil-simple', name: 'Pencil', key: 'P', desc: 'Draw freehand' },
    { icon: 'text-aa', name: 'Text', key: 'T', desc: 'Add text' },
    { icon: 'eraser', name: 'Eraser', key: 'E', desc: 'Erase objects' },
    { icon: 'fire', name: 'Laser', key: 'K', desc: 'Temporary beam that fades' }
  ];

  var shortcuts = [
    { title: 'Tools', rows: tools.map(function (t) { return { keys: [t.key], action: t.name + ' tool' }; }) },
    { title: 'Actions', rows: [
      { keys: ['Ctrl', 'Z'], action: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
      { keys: ['Ctrl', 'Y'], action: 'Redo (alternative)' },
      { keys: ['Ctrl', 'D'], action: 'Duplicate selected' },
      { keys: ['Ctrl', 'C'], action: 'Copy selected' },
      { keys: ['Ctrl', 'V'], action: 'Paste' },
      { keys: ['Ctrl', 'A'], action: 'Select all' },
      { keys: ['Delete'], action: 'Delete selected' },
      { keys: ['Backspace'], action: 'Delete selected' },
      { keys: ['Escape'], action: 'Deselect / finish editing' },
      { keys: ['Ctrl', 'Enter'], action: 'Finish text editing' }
    ]},
    { title: 'Navigation', rows: [
      { keys: ['Ctrl', '+'], action: 'Zoom in' },
      { keys: ['Ctrl', '-'], action: 'Zoom out' },
      { keys: ['Ctrl', '0'], action: 'Reset zoom to 100%' },
      { keys: ['Shift', '1'], action: 'Zoom to fit content' },
      { keys: ['Space'], action: 'Hold to temporarily pan' },
      { keys: ['9'], action: 'Open image file picker' }
    ]},
    { title: 'Nudging', rows: [
      { keys: ['Arrow keys'], action: 'Nudge selected 1px' },
      { keys: ['Shift', 'Arrow keys'], action: 'Nudge selected 10px' }
    ]}
  ];

  var workflow = [
    { num: '01', title: 'Create', desc: 'Pick a tool and draw your first shape on the canvas.', color: '#3b82f6' },
    { num: '02', title: 'Edit', desc: 'Select, move, resize, and arrange shapes on the infinite canvas.', color: '#8b5cf6' },
    { num: '03', title: 'Style', desc: 'Apply colors, strokes, fills, and opacity from the Style panel.', color: '#f97066' },
    { num: '04', title: 'Connect', desc: 'Draw arrows between shapes to show relationships and flow.', color: '#22c55e' },
    { num: '05', title: 'Export', desc: 'Download your board as PNG, JPG, PDF, or share a JSON file.', color: '#ec4899' }
  ];

  var tips = [
    { icon: 'cursor-click', title: 'Stay in Select mode', desc: 'Switch back to Select after drawing so you never accidentally add a shape.' },
    { icon: 'magnifying-glass-plus', title: 'Scroll to zoom', desc: 'Scroll wheel is the fastest way to focus on detail.' },
    { icon: 'hand-grabbing', title: 'Space + drag', desc: 'Pan across the canvas without switching tools.' },
    { icon: 'file-json', title: 'Export as JSON', desc: 'Save shape data so you can resume editing later.' },
    { icon: 'palette', title: 'Try different styles', desc: 'Colors and strokes make boards easier to scan.' },
    { icon: 'arrow-counter-clockwise', title: 'Undo freely', desc: 'Up to 200 steps of history per session.' }
  ];

  var examples = [
    { tag: 'Mind Map', title: 'Product Launch Planning', desc: 'Branches for marketing, engineering, design, and launch day. Sticky notes for open questions.', kind: 'mind' },
    { tag: 'Wireframe', title: 'Mobile Learning App', desc: 'Three-screen flow from course browser to lesson player.', kind: 'wire' },
    { tag: 'Flowchart', title: 'User Onboarding', desc: 'Sign up, verify, profile, tour, then dashboard.', kind: 'flow' },
    { tag: 'Brainstorming', title: 'Feature Prioritization', desc: 'Impact vs. effort matrix with voted sticky notes and sprint assignments.', kind: 'matrix' },
    { tag: 'Study Notes', title: 'Data Structures', desc: 'BST, min-heap, comparison table.', kind: 'tree' },
    { tag: 'Architecture', title: 'System Design', desc: 'Full-stack with microservices and monitoring.', kind: 'arch' }
  ];

  var faq = [
    { q: 'Is Kanvas free to use?', a: 'Yes. Kanvas is free to use directly in your browser with no account required.' },
    { q: 'Do I need an account?', a: 'No. You can start creating immediately without creating an account. Your boards are saved locally in your browser.' },
    { q: 'Where is my work saved?', a: "Your boards are automatically saved to your browser's local storage. This means your work persists across page refreshes, but it is tied to the browser and device you're using. Clearing browser data will remove saved boards." },
    { q: 'Can I share my board?', a: 'You can export your board as PNG, JPG, PDF, SVG, or JSON and share the file. JSON files can be imported back into Kanvas. There is no cloud sharing or collaborative editing in the current version.' },
    { q: 'What image formats are supported?', a: 'Kanvas supports PNG, JPEG, SVG, and WebP image formats. The maximum file size is 20 MB. Images are automatically resized if they exceed 2048px on any side.' },
    { q: 'Does Kanvas work offline?', a: 'Kanvas runs entirely in your browser. Once loaded, the core drawing tools work without an internet connection. However, you need an internet connection to initially load the application.' }
  ];

  var sections = [
    /* 01 ---------------------------------------------------- */
    { id: 'getting-started', num: '01', icon: 'play', title: 'Getting Started',
      desc: 'Open Kanvas, pick a tool, and draw your first shape — no account, no setup.',
      blocks: [
        { type: 'editorial', visual: 'idea', label: 'Quick start', heading: 'How to start creating',
          list: [
            ['Open', ' Kanvas in your browser'],
            ['Choose', ' a tool from the left toolbar'],
            ['Click and drag', ' on the canvas to create shapes'],
            ['Switch back', ' to Select to move and edit'],
            ['Use', ' the Style panel to customize colors and strokes']
          ]},
        { type: 'action', label: 'Draw your first rectangle',
          action: { badge: 'Action', caption: 'Select Rectangle tool, click and drag on canvas', art: 'drawRect' },
          result: { badge: 'Result', caption: 'Shape appears with default style, ready to edit', art: 'resultRect' } },
        { type: 'steps', items: [
          ['Press', ' R to activate the Rectangle tool'],
          ['Click and drag', ' anywhere on the canvas'],
          ['Release', ' to drop the shape'],
          ['Press', ' V and drag it into place']
        ]}
      ]},

    /* 02 ---------------------------------------------------- */
    { id: 'workflow', num: '02', icon: 'path', title: 'From Idea to Canvas', toc: false, nav: false,
      desc: 'Every creation follows a journey. Here is how ideas become something real in Kanvas.',
      blocks: [{ type: 'workflow', items: workflow }] },

    /* 03 ---------------------------------------------------- */
    { id: 'tools', num: '03', icon: 'cursor', title: 'Tools',
      desc: 'Every tool you need to create, draw, and design — from selecting objects to freehand sketching.',
      blocks: [
        { type: 'toolCanvas' },
        { type: 'tools', items: tools },
        { type: 'stats', items: [
          { icon: 'square', label: '7 shape tools' },
          { icon: 'pencil-simple', label: 'Freehand pencil' },
          { icon: 'fire', label: 'Laser pointer' },
          { icon: 'text-aa', label: 'Live text' },
          { icon: 'image', label: 'Image import' },
          { icon: 'hand-grabbing', label: 'Pan & zoom' }
        ]}
      ]},

    /* 04 ---------------------------------------------------- */
    { id: 'try-it', num: '04', icon: 'mouse-pointer-click', title: 'Try It Live', toc: false, nav: false,
      desc: 'Click a shape on the canvas to select it. Change its color from the style panel. This is how Kanvas feels.',
      blocks: [{ type: 'shapeTry' }] },

    /* 05 ---------------------------------------------------- */
    { id: 'drawing', num: '05', icon: 'pen', title: 'Drawing',
      desc: 'All shape types on one canvas — rectangles, ellipses, diamonds, arrows, lines, text, and freehand.',
      blocks: [
        { type: 'editorial', visual: 'shapes', label: 'Shapes', heading: 'Connect and relate shapes',
          list: [
            ['Press R', ' or click the Rectangle tool in the toolbar'],
            ['Click and drag', ' on the canvas to set the size'],
            ['Release', ' to create the shape'],
            ['Press V', ' to switch to Select and move it']
          ]},
        { type: 'editorial', visual: 'pen', label: 'Freehand', heading: 'Sketch a quick wireframe', reversed: true,
          list: [
            ['Press P', ' or click the pencil tool to start drawing'],
            ['Click and drag', ' to sketch freehand strokes'],
            ['Adjust stroke width', ' in the Style panel for thick or thin lines'],
            ['Combine with shapes', ' — sketch over rectangles and arrows for a rough look'],
            ['Use for wireframes', ' — quick, imperfect layouts before committing to precision'],
            ['Annotate', ' — circle issues, cross out ideas, star important items']
          ]},
        { type: 'steps', items: [
          ['Press', ' P to activate the Pencil tool'],
          ['Draw', ' a rough phone outline — no need to be precise'],
          ['Add', ' a header bar, image block, and text lines inside'],
          ['Press V', ', select a shape, and change its color in the Style panel']
        ]}
      ]},

    /* 06 ---------------------------------------------------- */
    { id: 'zoom', num: '06', icon: 'magnifying-glass-plus', title: 'Zoom & Canvas Navigation',
      desc: 'Zoom and pan around your canvas — the canvas never runs out.',
      blocks: [
        { type: 'cards', items: [
          { icon: 'plus', title: 'Zoom in', desc: 'Scroll wheel, Ctrl +, or click + in the zoom control.' },
          { icon: 'minus', title: 'Zoom out', desc: 'Ctrl −, or click − in the zoom control.' },
          { icon: 'target', title: 'Reset', desc: 'Click the percentage or press Ctrl 0 for 100%.' },
          { icon: 'frame-corners', title: 'Zoom to fit', desc: 'Shift 1 frames all content in view.' },
          { icon: 'hand-grabbing', title: 'Pan', desc: 'Hold Space and drag, or switch to the Hand tool.' },
          { icon: 'expand', title: 'Fullscreen', desc: 'Click the fullscreen button to hide browser chrome.' }
        ]},
        { type: 'zoomDemo' }
      ]},

    /* 07 ---------------------------------------------------- */
    { id: 'undo-redo', num: '07', icon: 'arrow-counter-clockwise', title: 'Undo & Redo',
      desc: 'Never worry about mistakes — history is generous and local to your session.',
      blocks: [
        { type: 'historyDemo' },
        { type: 'stats', items: [
          { icon: 'arrow-counter-clockwise', label: '200 steps' },
          { icon: 'clock-counter-clockwise', label: 'Session-based' },
          { icon: 'device-mobile', label: 'Preserved while the tab is open' }
        ]},
        { type: 'cards', items: [
          { icon: 'arrow-u-up-left', title: 'Undo', desc: 'Ctrl + Z steps back through every change you made.' },
          { icon: 'arrow-u-up-right', title: 'Redo', desc: 'Ctrl + Shift + Z puts the change back exactly where it was.' }
        ]}
      ]},

    /* 08 ---------------------------------------------------- */
    { id: 'styling', num: '08', icon: 'palette', title: 'Color & Styling',
      desc: 'Make every shape your own — colors, strokes, fills, opacity, and layer order.',
      blocks: [
        { type: 'stats', items: [
          { icon: 'drop', label: '6 stroke colors' },
          { icon: 'fill', label: '5 fill colors' },
          { icon: 'arrows-horizontal', label: '3 stroke widths' },
          { icon: 'dashed-line', label: '3 stroke styles' },
          { icon: 'sliders-horizontal', label: 'Opacity slider' },
          { icon: 'rounded-corner', label: 'Corner radius' }
        ]},
        { type: 'cards', items: [
          { icon: 'palette', title: 'Color Palette', desc: 'Kanvas provides six curated stroke colors and five fill colors. Select any shape and pick a swatch from the Style panel.' },
          { icon: 'fill', title: 'Fill', desc: 'Fill applies a background color to rectangles, ellipses, and diamonds. Shapes start transparent — add a fill to make them solid.' },
          { icon: 'arrows-out-line', title: 'Stroke Width', desc: 'Control the thickness of shape outlines. Choose from Thin (1px), Medium (3px), or Thick (6px) in the Style panel.' },
          { icon: 'dashed-line', title: 'Stroke Style', desc: 'Change how outlines render. Solid is the default, but dashed and dotted styles add visual variety.' },
          { icon: 'eye', title: 'Opacity', desc: 'Slide from 0% (fully transparent) to 100% (fully opaque). Useful for layering shapes and creating depth.' },
          { icon: 'rounded-corner', title: 'Corner Style', desc: 'Rectangles support two corner modes: sharp (radius 0) and rounded (radius 8). Toggle from the Style panel.' },
          { icon: 'text-aa', title: 'Font Size', desc: 'Text objects support ten preset sizes from 12px to 48px. Select a text shape and choose from the dropdown.' },
          { icon: 'squares-four', title: 'Combined Styles', desc: 'Mix and match fill, stroke, width, style, and opacity to create polished compositions. Here are some common patterns.' },
          { icon: 'layers-three', title: 'Layer Order', desc: 'Arrange objects in front of or behind others using Bring Forward, Send Backward, Bring to Front, and Send to Back.' },
          { icon: 'flip-horizontal', title: 'Image Controls', desc: 'Flip images horizontally or vertically. Lock images to prevent accidental edits.' }
        ]}
      ]},

    /* 09 ---------------------------------------------------- */
    { id: 'themes', num: '09', icon: 'sun-dim', title: 'Light & Dark Mode',
      desc: 'One toggle, every surface — canvas, toolbars and panels switch together.',
      blocks: [
        { type: 'themeDemo' },
        { type: 'cards', items: [
          { icon: 'paint-brush', title: 'Canvas background', desc: 'White in light mode, deep gray in dark mode.' },
          { icon: 'palette', title: 'Shape colors', desc: 'Auto-adjusted for readability on either background.' },
          { icon: 'layout', title: 'All UI elements', desc: 'Toolbars, panels and menus follow the theme instantly.' },
          { icon: 'device-mobile', title: 'Persistent', desc: 'Your choice is saved across sessions.' }
        ]}
      ]},

    /* 10 ---------------------------------------------------- */
    { id: 'export', num: '10', icon: 'download-simple', title: 'Export Your Board',
      desc: 'Save, share, and export your work in any format — PNG, PDF, SVG, or JSON.',
      blocks: [
        { type: 'exportDemo' },
        { type: 'cards', items: [
          { icon: 'image', title: 'PNG', desc: 'High-res image with transparent background.' },
          { icon: 'image', title: 'JPG', desc: '92% quality, smaller file size.' },
          { icon: 'file-pdf', title: 'PDF', desc: 'Printable document for archiving.' },
          { icon: 'file-code', title: 'SVG', desc: 'Vector format, scales to any size.' },
          { icon: 'file-json', title: 'JSON', desc: 'Save shape data, import later to resume.' },
          { icon: 'clipboard', title: 'Copy Image', desc: 'Paste board directly into other apps.' },
          { icon: 'printer', title: 'Print', desc: 'Open system print dialog.' },
          { icon: 'arrow-square-in', title: 'Import JSON', desc: 'Drag a JSON file onto the canvas to restore.' }
        ]},
        { type: 'steps', items: [
          ['Click', ' the Export button in the top bar'],
          ['Choose', ' your format from the menu'],
          ['Download', ' the file or copy it to the clipboard']
        ]}
      ]},

    /* 11 ---------------------------------------------------- */
    { id: 'shortcuts', num: '11', icon: 'code', title: 'Keyboard Shortcuts',
      desc: 'Speed up your workflow with keyboard shortcuts. Shortcuts are disabled while editing text.',
      blocks: [{ type: 'shortcuts', items: shortcuts }] },

    /* 12 ---------------------------------------------------- */
    { id: 'tips', num: '12', icon: 'zap', title: 'Tips for a Better Experience',
      desc: 'Work smarter on the canvas with a handful of habits that pay off immediately.',
      blocks: [{ type: 'tips', items: tips }] },

    /* 13 ---------------------------------------------------- */
    { id: 'examples', num: '13', icon: 'layout', title: 'What You Can Create',
      desc: 'Real boards people build with Kanvas — from quick sketches to polished diagrams.',
      blocks: [{ type: 'gallery', items: examples }] },

    /* 14 ---------------------------------------------------- */
    { id: 'faq', num: '14', icon: 'info', title: 'FAQ',
      desc: 'Everything you need to know to start creating.',
      blocks: [
        { type: 'editorial', visual: 'faq', label: 'Questions', heading: 'Common answers',
          list: [
            ['Free to use', ' — no account required'],
            ['Local storage', ' — saves to your browser'],
            ['Export formats', ' — PNG, JPG, PDF, SVG, JSON'],
            ['Offline capable', ' — core tools work without internet'],
            ['Image support', ' — PNG, JPEG, SVG, WebP up to 20 MB']
          ]},
        { type: 'faq', items: faq },
        { type: 'end' }
      ]}
  ];

  return { nav: nav, toc: toc, sections: sections, tools: tools, tips: tips, examples: examples, faq: faq };
})();
