export function BoardCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4 mt-3"></div>
        </div>
      </div>
    </div>
  );
}

export function BoardPageSkeleton() {
  return (
    <div className="min-h-screen bg-blue-600">
      <nav className="bg-blue-700 px-6 py-4 flex items-center gap-4">
        <div className="h-4 bg-blue-500 rounded w-24 animate-pulse"></div>
        <div className="h-5 bg-blue-500 rounded w-40 animate-pulse"></div>
      </nav>
      <div className="p-6 flex gap-4 items-start">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-72 bg-gray-100 rounded-xl shadow p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="bg-white rounded-lg px-3 py-2 shadow-sm">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}