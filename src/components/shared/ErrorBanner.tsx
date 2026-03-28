interface Props {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 px-4 py-3 rounded-xl flex items-start gap-3"
    >
      <span className="text-xl" aria-hidden="true">⚠️</span>
      <p className="flex-1 font-medium">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
