import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionText,
  actionHref,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mb-6">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {title}
      </h2>
      <p className="text-gray-600 mb-6 max-w-xl mx-auto">
        {description}
      </p>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}