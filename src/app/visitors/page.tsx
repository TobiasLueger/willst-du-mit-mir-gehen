import { fetchValentineVisitors, formatVisitorData } from '@/utils/fetchVisitors';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VisitorsPage() {
  const visitors = await fetchValentineVisitors();

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-pink-50 to-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-8">
          Valentine Besucher 💝
        </h1>
        
        <div className="space-y-6">
          {visitors.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Noch keine Besucher gefunden 🥺
            </p>
          ) : (
            visitors.map((visitor, index) => (
              <div
                key={visitor.timestamp + index}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                  {formatVisitorData(visitor)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
