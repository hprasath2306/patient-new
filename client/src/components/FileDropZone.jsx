import { useState, useRef } from 'react';
import { Upload, FileText, X, File } from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const iconForType = (type) => {
  if (type?.startsWith('image/')) return '🖼️';
  if (type?.includes('pdf')) return '📄';
  if (type?.includes('word') || type?.includes('document')) return '📝';
  if (type?.includes('spreadsheet') || type?.includes('excel')) return '📊';
  return '📎';
};

export default function FileDropZone({ file, onFileSelect, onClear, accept }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
  };

  if (file) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', background: 'var(--primary-50)',
        border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-sm)',
      }}>
        <span style={{ fontSize: '1.5rem' }}>{iconForType(file.type)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 500, fontSize: '0.85rem', wordBreak: 'break-all', marginBottom: 2 }}>
            {file.name}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {formatSize(file.size)} &middot; {file.type || 'Unknown type'}
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          style={{ color: 'var(--danger)', flexShrink: 0 }}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '32px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragOver ? 'var(--primary-50)' : 'var(--bg)',
        transition: 'all 0.2s ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept || '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv,.txt'}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <Upload
        size={32}
        style={{ color: dragOver ? 'var(--primary)' : 'var(--text-muted)', marginBottom: 10 }}
      />
      <p style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 4, color: 'var(--text)' }}>
        {dragOver ? 'Drop file here' : 'Drag & drop a file here'}
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        or <span style={{ color: 'var(--primary)', fontWeight: 500 }}>click to browse</span>
      </p>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 8 }}>
        PDF, DOC, DOCX, JPG, PNG, XLS, CSV supported
      </p>
    </div>
  );
}
