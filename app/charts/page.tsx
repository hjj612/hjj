import ForexCharts from '../../components/ForexCharts';
import Link from 'next/link';

export default function ChartsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← 홈으로 돌아가기
              </Link>
              <div className="text-2xl font-bold text-gray-900">
                실시간 환율 차트
              </div>
            </div>
            <div className="text-sm text-gray-500">
              매 5분마다 자동 업데이트
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ForexCharts />
      </div>
    </main>
  );
} 