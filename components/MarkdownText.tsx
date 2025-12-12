import React from 'react';

const MarkdownText = ({ text }: { text: string }) => {
  const renderInline = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-sm font-mono border border-slate-200 break-all">{part.slice(1, -1)}</code>;
      return part;
    });
  };

  // Split by code blocks
  const blocks = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-slate-700 leading-7 space-y-4">
      {blocks.map((block, i) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          // Attempt to remove language identifier from first line
          let cleanContent = block.slice(3, -3);
          const lines = cleanContent.split('\n');
          // Simple check: if first line is short and looks like a language name, remove it
          if (lines.length > 0) {
             const firstLine = lines[0].trim().toLowerCase();
             if (['bash', 'sh', 'sql', 'python', 'py', 'json', 'yaml', 'yml', 'javascript', 'ts', 'js'].includes(firstLine)) {
                cleanContent = lines.slice(1).join('\n');
             }
          }
          
          return (
            <pre key={i} className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto font-mono text-sm my-4 shadow-md border border-slate-700">
              <code>{cleanContent.trim()}</code>
            </pre>
          );
        }
        
        return (
            <div key={i} className="space-y-3">
                {block.split('\n').map((line, j) => {
                   const trimmed = line.trim();
                   if (!trimmed) return null;
                   
                   if (trimmed.startsWith('### ')) return <h3 key={j} className="text-lg font-bold text-slate-800 mt-6 mb-2">{renderInline(trimmed.slice(4))}</h3>;
                   if (trimmed.startsWith('## ')) return <h2 key={j} className="text-xl font-bold text-slate-900 mt-8 mb-3 border-b border-slate-200 pb-2">{renderInline(trimmed.slice(3))}</h2>;
                   if (trimmed.startsWith('# ')) return <h1 key={j} className="text-2xl font-bold text-slate-900 mt-8 mb-4">{renderInline(trimmed.slice(2))}</h1>;
                   
                   // Handle bullets (- or *)
                   if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                       return (
                           <div key={j} className="flex gap-2 ml-4">
                               <span className="text-indigo-500 font-bold shrink-0">•</span>
                               <span>{renderInline(trimmed.slice(2))}</span>
                           </div>
                       )
                   }
                   
                   // Handle numbered lists
                   if (/^\d+\.\s/.test(trimmed)) {
                        const [num, ...rest] = trimmed.split('.');
                        return (
                           <div key={j} className="flex gap-2 ml-4">
                               <span className="text-indigo-500 font-bold shrink-0">{num}.</span>
                               <span>{renderInline(rest.join('.').trim())}</span>
                           </div>
                        )
                   }

                   return <p key={j} className="mb-2">{renderInline(trimmed)}</p>;
                })}
            </div>
        )
      })}
    </div>
  );
};

export default MarkdownText;