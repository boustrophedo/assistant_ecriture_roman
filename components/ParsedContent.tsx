import React from 'react';

interface ParsedContentProps {
  text: string;
}

const ParsedContent: React.FC<ParsedContentProps> = ({ text }) => {
    const parts = text.split(/(\[ORIGINAL\].*?\[\/ORIGINAL\]|\[USER\].*?\[\/USER\])/g);
    
    return (
      <>
        {parts.map((part, i) => { 
          if (part.startsWith('[ORIGINAL]')) { 
            return <span key={i} className="verbatim verbatim-original">{part.slice(10, -11)}</span>; 
          } 
          if (part.startsWith('[USER]')) { 
            return <span key={i} className="verbatim verbatim-user">{part.slice(6, -7)}</span>; 
          } 
          return <span key={i}>{part}</span>; 
        })}
      </>
    );
};

export default ParsedContent;
