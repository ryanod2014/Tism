'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './DiagramEditor.module.css';

export interface DiagramEditorProps {
  onClose: () => void;
  onInsert: (mermaid: string) => void;
  initialNodes?: DiagramNode[];
  initialLines?: DiagramLine[];
}

export interface DiagramNode {
  id: string;
  type: 'rectangle' | 'rounded' | 'diamond' | 'circle' | 'cylinder';
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
}

export interface DiagramLine {
  from: string;
  to: string;
  label?: string;
}

export function DiagramEditor({ onClose, onInsert, initialNodes, initialLines }: DiagramEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTool, setCurrentTool] = useState<string>('select');
  const [nodes, setNodes] = useState<DiagramNode[]>(initialNodes || []);
  const [lines, setLines] = useState<DiagramLine[]>(initialLines || []);
  const [selectedNode, setSelectedNode] = useState<DiagramNode | null>(null);
  const [dragging, setDragging] = useState<{ node: DiagramNode; offsetX: number; offsetY: number } | null>(null);
  const nodeCounter = useRef(0);

  // Initialize with default diagram if no initial data provided
  useEffect(() => {
    if (nodes.length === 0 && !initialNodes) {
      const defaultNodes: DiagramNode[] = [
        { id: 'A', type: 'rounded', x: 400, y: 80, w: 120, h: 45, text: 'Start' },
        { id: 'B', type: 'diamond', x: 400, y: 180, w: 120, h: 70, text: 'Choice?' },
        { id: 'C', type: 'rectangle', x: 260, y: 300, w: 100, h: 45, text: 'Option A' },
        { id: 'D', type: 'rectangle', x: 540, y: 300, w: 100, h: 45, text: 'Option B' },
        { id: 'E', type: 'rounded', x: 400, y: 400, w: 120, h: 45, text: 'End' },
      ];
      const defaultLines: DiagramLine[] = [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C', label: 'yes' },
        { from: 'B', to: 'D', label: 'no' },
        { from: 'C', to: 'E' },
        { from: 'D', to: 'E' },
      ];
      setNodes(defaultNodes);
      setLines(defaultLines);
      nodeCounter.current = 5;
    }
  }, [nodes.length, initialNodes]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw lines
    lines.forEach(line => {
      const fromNode = nodes.find(n => n.id === line.from);
      const toNode = nodes.find(n => n.id === line.to);
      if (!fromNode || !toNode) return;

      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y + fromNode.h / 2);
      ctx.lineTo(toNode.x, toNode.y - toNode.h / 2);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(toNode.y - toNode.h / 2 - (fromNode.y + fromNode.h / 2), toNode.x - fromNode.x);
      const arrowX = toNode.x;
      const arrowY = toNode.y - toNode.h / 2;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI / 6), arrowY - 10 * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI / 6), arrowY - 10 * Math.sin(angle + Math.PI / 6));
      ctx.stroke();

      // Label
      if (line.label) {
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + fromNode.h / 2 + toNode.y - toNode.h / 2) / 2;
        ctx.fillStyle = '#a855f7';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(line.label, midX + 15, midY);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      ctx.fillStyle = isSelected ? 'rgba(0, 212, 255, 0.2)' : 'rgba(30, 30, 50, 0.9)';
      ctx.strokeStyle = isSelected ? '#00d4ff' : '#4a4a6a';
      ctx.lineWidth = isSelected ? 2 : 1;

      const x = node.x - node.w / 2;
      const y = node.y - node.h / 2;

      ctx.beginPath();
      if (node.type === 'rectangle') {
        ctx.rect(x, y, node.w, node.h);
      } else if (node.type === 'rounded') {
        const r = 10;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + node.w - r, y);
        ctx.quadraticCurveTo(x + node.w, y, x + node.w, y + r);
        ctx.lineTo(x + node.w, y + node.h - r);
        ctx.quadraticCurveTo(x + node.w, y + node.h, x + node.w - r, y + node.h);
        ctx.lineTo(x + r, y + node.h);
        ctx.quadraticCurveTo(x, y + node.h, x, y + node.h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
      } else if (node.type === 'diamond') {
        ctx.moveTo(node.x, y);
        ctx.lineTo(x + node.w, node.y);
        ctx.lineTo(node.x, y + node.h);
        ctx.lineTo(x, node.y);
        ctx.closePath();
      } else if (node.type === 'circle') {
        ctx.arc(node.x, node.y, node.w / 2, 0, Math.PI * 2);
      } else if (node.type === 'cylinder') {
        // Database/cylinder shape
        const ellipseH = node.h * 0.2;
        ctx.ellipse(node.x, y + ellipseH / 2, node.w / 2, ellipseH / 2, 0, 0, Math.PI * 2);
        ctx.moveTo(x, y + ellipseH / 2);
        ctx.lineTo(x, y + node.h - ellipseH / 2);
        ctx.ellipse(node.x, y + node.h - ellipseH / 2, node.w / 2, ellipseH / 2, 0, Math.PI, 0);
        ctx.lineTo(x + node.w, y + ellipseH / 2);
      }
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.text, node.x, node.y);

      // Connection points when selected
      if (isSelected) {
        const points = [
          { x: node.x, y: y },
          { x: x + node.w, y: node.y },
          { x: node.x, y: y + node.h },
          { x: x, y: node.y },
        ];
        points.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#00d4ff';
          ctx.fill();
        });
      }
    });
  }, [nodes, lines, selectedNode]);

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode) {
          setNodes(nodes.filter(n => n.id !== selectedNode.id));
          setLines(lines.filter(l => l.from !== selectedNode.id && l.to !== selectedNode.id));
          setSelectedNode(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedNode, nodes, lines]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a node
    const clickedNode = nodes.find(n => 
      x >= n.x - n.w / 2 && x <= n.x + n.w / 2 &&
      y >= n.y - n.h / 2 && y <= n.y + n.h / 2
    );

    if (currentTool === 'select') {
      setSelectedNode(clickedNode || null);
    } else if (currentTool !== 'select' && currentTool !== 'arrow' && currentTool !== 'line' && currentTool !== 'delete') {
      // Add new node
      const newNode: DiagramNode = {
        id: String.fromCharCode(65 + nodeCounter.current++),
        type: currentTool as DiagramNode['type'],
        x, y,
        w: currentTool === 'diamond' ? 120 : currentTool === 'circle' ? 60 : 100,
        h: currentTool === 'diamond' ? 70 : currentTool === 'circle' ? 60 : 45,
        text: 'New',
      };
      setNodes([...nodes, newNode]);
      setCurrentTool('select');
    } else if (currentTool === 'delete' && clickedNode) {
      setNodes(nodes.filter(n => n.id !== clickedNode.id));
      setLines(lines.filter(l => l.from !== clickedNode.id && l.to !== clickedNode.id));
      setSelectedNode(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(n => 
      x >= n.x - n.w / 2 && x <= n.x + n.w / 2 &&
      y >= n.y - n.h / 2 && y <= n.y + n.h / 2
    );

    if (clickedNode && currentTool === 'select') {
      setDragging({ node: clickedNode, offsetX: x - clickedNode.x, offsetY: y - clickedNode.y });
      setSelectedNode(clickedNode);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(n => 
      n.id === dragging.node.id 
        ? { ...n, x: x - dragging.offsetX, y: y - dragging.offsetY }
        : n
    ));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(n => 
      x >= n.x - n.w / 2 && x <= n.x + n.w / 2 &&
      y >= n.y - n.h / 2 && y <= n.y + n.h / 2
    );

    if (clickedNode) {
      const newText = prompt('Edit node text:', clickedNode.text);
      if (newText !== null) {
        setNodes(nodes.map(n => n.id === clickedNode.id ? { ...n, text: newText } : n));
      }
    }
  };

  const generateMermaid = (): string => {
    let code = 'flowchart TD\n';
    nodes.forEach(n => {
      const shape = n.type === 'diamond' ? `{${n.text}}` 
        : n.type === 'rounded' ? `(${n.text})` 
        : n.type === 'circle' ? `((${n.text}))`
        : n.type === 'cylinder' ? `[(${n.text})]`
        : `[${n.text}]`;
      code += `    ${n.id}${shape}\n`;
    });
    lines.forEach(l => {
      const arrow = l.label ? `-->|${l.label}|` : '-->';
      code += `    ${l.from} ${arrow} ${l.to}\n`;
    });
    return code;
  };

  const clearDiagram = () => {
    setNodes([]);
    setLines([]);
    setSelectedNode(null);
    nodeCounter.current = 0;
  };

  const tools = [
    { id: 'select', icon: <svg viewBox="0 0 24 24"><path d="M4 4l7 17 2.5-6.5L20 12z" /></svg>, title: 'Select (V)' },
    { id: 'divider1', divider: true },
    { id: 'rectangle', icon: <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1" /></svg>, title: 'Rectangle (R)' },
    { id: 'rounded', icon: <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="7" /></svg>, title: 'Rounded (U)' },
    { id: 'diamond', icon: <svg viewBox="0 0 24 24"><path d="M12 3L21 12L12 21L3 12Z" /></svg>, title: 'Decision (D)' },
    { id: 'circle', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>, title: 'Circle (C)' },
    { id: 'cylinder', icon: <svg viewBox="0 0 24 24"><path d="M12 5c3.866 0 7 1.12 7 2.5v9c0 1.38-3.134 2.5-7 2.5s-7-1.12-7-2.5v-9C5 6.12 8.134 5 12 5z" /><ellipse cx="12" cy="7.5" rx="7" ry="2.5" /></svg>, title: 'Database' },
    { id: 'divider2', divider: true },
    { id: 'arrow', icon: <svg viewBox="0 0 24 24"><path d="M5 12h14M14 6l6 6-6 6" /></svg>, title: 'Arrow (A)' },
    { id: 'divider3', divider: true },
    { id: 'delete', icon: <svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M10 11v6M14 11v6" /></svg>, title: 'Delete (Del)' },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.title}>Create Diagram</span>
            <button className={styles.btnSecondary} onClick={clearDiagram}>Clear</button>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button className={styles.btnPrimary} onClick={() => onInsert(generateMermaid())}>
              Insert to Chat
            </button>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.toolbar}>
            {tools.map(tool => 
              tool.divider ? (
                <div key={tool.id} className={styles.toolbarDivider} />
              ) : (
                <button
                  key={tool.id}
                  className={`${styles.toolbarBtn} ${currentTool === tool.id ? styles.active : ''}`}
                  title={tool.title}
                  onClick={() => setCurrentTool(tool.id)}
                >
                  {tool.icon}
                </button>
              )
            )}
          </div>
          <div className={styles.canvasContainer} ref={containerRef}>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <span>{nodes.length} nodes</span>
            <span className={styles.dot}>•</span>
            <span>{lines.length} connections</span>
            <span className={styles.separator}>|</span>
            <span className={styles.hint}>Click shape tool then canvas to add</span>
            <span className={styles.hint}>Drag nodes to move</span>
            <span className={styles.hint}>Double-click to edit text</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiagramEditor;
