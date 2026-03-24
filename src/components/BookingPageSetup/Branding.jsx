import React, { useRef } from 'react';

export default function Branding({ values, onChange }) {
  const { logoUrl = '', companyName = '' } = values;
  const fileRef = useRef(null);

  function set(key, val) { onChange({ ...values, [key]: val }); }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    set('logoUrl', URL.createObjectURL(file));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Logo */}
      <div>
        <FL>Company logo</FL>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 8,
            border: '2px dashed #d1d5db', background: '#fafafa',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
          }}>
            {logoUrl
              ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 20 }}>🗓️</span>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                height: 30, padding: '0 12px',
                border: '1px solid #d1d5db', borderRadius: 6,
                fontSize: 12, fontWeight: 500, color: '#374151',
                background: '#fff', cursor: 'pointer',
                transition: 'background 0.1s',
              }}
            >Upload logo</button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => set('logoUrl', '')}
                style={{ fontSize: 11, color: '#ef4444', textAlign: 'left', cursor: 'pointer' }}
              >Remove</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>

      {/* Company name */}
      <div>
        <FL>Company name</FL>
        <input
          type="text" value={companyName} maxLength={255}
          placeholder="Enter the company name"
          onChange={e => set('companyName', e.target.value)}
          style={{
            width: '100%', height: 34, padding: '0 10px',
            border: '1px solid #d1d5db', borderRadius: 6,
            fontSize: 12.5, color: '#111827', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'}
          onBlur={e => e.target.style.borderColor = '#d1d5db'}
        />
      </div>
    </div>
  );
}

function FL({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{children}</div>;
}
