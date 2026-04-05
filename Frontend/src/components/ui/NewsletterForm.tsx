import { useState } from 'react';
import { subscribeToNewsletter } from '../../api';

interface NewsletterFormProps {
  /** 'light' = white bg (footer), 'dark' = dark bg input (homepage section) */
  variant?: 'light' | 'dark';
  buttonLabel?: string;
}

export function NewsletterForm({ variant = 'light', buttonLabel = 'Subscribe' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await subscribeToNewsletter(email.trim());
      setStatus('success');
      setMessage(res.message || 'You\'re subscribed!');
      setEmail('');
    } catch (err: any) {
      const errMsg: string = err?.message ?? '';
      if (errMsg.toLowerCase().includes('already subscribed')) {
        setStatus('duplicate');
        setMessage('This email is already subscribed.');
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    }
  };

  const inputClass =
    variant === 'dark'
      ? 'flex-1 bg-white border border-gray-300 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors'
      : 'flex-1 bg-white border border-gray-300 px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors';

  const btnClass =
    'px-6 py-3 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-60 whitespace-nowrap';

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 py-3">
        <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm text-gray-700">{message}</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-0">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          placeholder="Enter your email"
          className={inputClass}
          disabled={status === 'loading'}
        />
        <button type="submit" className={btnClass} disabled={status === 'loading'}>
          {status === 'loading' ? '...' : buttonLabel}
        </button>
      </form>
      {(status === 'error' || status === 'duplicate') && (
        <p className="mt-2 text-xs text-red-500">{message}</p>
      )}
    </div>
  );
}
