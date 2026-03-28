interface Props {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message = 'Loading...', size = 'md' }: Props) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12" role="status" aria-live="polite">
      <div
        className={`${sizes[size]} border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin`}
        aria-hidden="true"
      />
      {message && (
        <p className="text-gray-600 dark:text-slate-300 font-medium text-center">{message}</p>
      )}
    </div>
  );
}
