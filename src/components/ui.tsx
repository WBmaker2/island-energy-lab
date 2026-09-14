// components/ui.tsx — 최소 shadcn-style primitives (밝은 테마 고정)
// 다크모드 자동 전환 없음 (00 §5).

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  variant = 'secondary',
  pulse = false,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; pulse?: boolean }) {
  const base =
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 focus-visible:ring-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none';
  const styles: Record<BtnVariant, string> = {
    primary: 'bg-sky-700 text-white hover:bg-sky-800',
    secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100',
    ghost: 'text-sky-800 hover:bg-sky-50',
    danger: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
  };
  return <button className={`${base} ${styles[variant]} ${pulse ? 'gi-pulse' : ''} ${className}`} {...rest} />;
}

export function Card({ title, sub, children, className = '' }: { title: string; sub?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`} aria-label={title}>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {sub && <p className="mt-0.5 text-sm text-slate-500">{sub}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-xs font-medium text-red-700">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

export function NumberInput({
  id,
  value,
  onChange,
  min,
  max,
  step = 'any',
  error,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: string;
  error?: string;
}) {
  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 ${error ? 'border-red-500' : 'border-slate-300'}`}
      value={Number.isFinite(value) ? value : ''}
      min={min}
      max={max}
      step={step}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.valueAsNumber)}
    />
  );
}

export function Badge({ kind, children }: { kind: 'ok' | 'warn' | 'bad' | 'info'; children: ReactNode }) {
  const map = {
    ok: 'border-green-300 bg-green-50 text-green-800',
    warn: 'border-amber-300 bg-amber-50 text-amber-900',
    bad: 'border-red-300 bg-red-50 text-red-800',
    info: 'border-sky-300 bg-sky-50 text-sky-900',
  } as const;
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[kind]}`}>{children}</span>;
}

export function StepNav({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm" aria-live="polite">
      <span className="font-bold text-sky-800">{current}/{total}단계</span>
      <span className="text-slate-600">{label}</span>
    </div>
  );
}

// Re-export to satisfy TS isolatedModules for InputHTMLAttributes usage
export type { InputHTMLAttributes };
