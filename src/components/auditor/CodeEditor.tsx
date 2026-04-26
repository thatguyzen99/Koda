'use client';

import { useRef, useState, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export default function CodeEditor({ value, onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const text = value ?? '';
    setLineCount(Math.max(1, text.split('\n').length));
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const text = value ?? '';
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = text.substring(0, start) + '  ' + text.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#0F172A]">
      <div className="flex-shrink-0 select-none border-r border-white/5 bg-[#0B1322] px-3 py-4 text-right">
        <div className="font-mono text-xs leading-6 text-slate-500">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="// Paste or type your schema here..."
          spellCheck={false}
          className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-slate-100 placeholder:text-slate-600 focus:outline-none"
          style={{ caretColor: '#A78BFA' }}
        />
      </div>
    </div>
  );
}
