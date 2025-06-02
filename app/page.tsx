import { Suspense } from 'react';
import ForexRates from '../components/ForexRates';
import ForexPredictions from '../components/ForexPredictions';
import TickerTapeWidget from '../components/TickerTapeWidget';
import ForexHeatmap from '../components/ForexHeatmap';
import ForexChatbot from './components/ForexChatbot';
import ForexCharts from '../components/ForexCharts';
import ForexReliabilityIndicator from '../components/ForexReliabilityIndicator';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center h-16 px-4">
            <div className="flex items-center text-lg">
              <span className="text-[#666666] font-medium">groqlabs</span>
              <span className="text-[#666666] mx-2">/</span>
              <span className="text-black font-medium">Korea Forex Bot</span>
              <span className="text-[#666666] mx-2">/</span>
              <Link 
                href="/charts" 
                className="text-[#ff4b4b] hover:text-[#ff6b6b] transition-colors mr-4"
              >
                환율 차트
              </Link>
              <Link 
                href="#" 
                className="text-[#ff4b4b] hover:text-[#ff6b6b] transition-colors"
              >
                Start New Chat
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-gray-100">
          <TickerTapeWidget />
        </div>
      </div>

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="mt-[60px] ml-[-60px] transform hover:scale-[1.02] transition-transform duration-300">
                <div className="rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] bg-white/90 backdrop-blur-sm border border-blue-100/50">
                  <ForexChatbot />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="w-full h-[400px] overflow-hidden ml-[60px] mt-[60px] transform hover:scale-[1.02] transition-transform duration-300">
                <div className="rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] bg-white/90 backdrop-blur-sm border border-blue-100/50">
                  <ForexHeatmap />
                </div>
              </div>
            </div>
          </div>

          {/* 신뢰도 향상 시스템 소개 */}
          <div className="mt-16 mb-8">
            <ForexReliabilityIndicator />
          </div>

          {/* 환율 차트 섹션 */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">주요 환율 동향</h2>
              <p className="text-gray-600">실시간 환율 변동을 한눈에 확인하세요</p>
            </div>
            <div className="transform hover:scale-[1.01] transition-transform duration-300">
              <div className="rounded-2xl shadow-[0_10px_30px_rgba(8,_112,_184,_0.1)] bg-white/95 backdrop-blur-sm border border-blue-50 p-6">
                <ForexCharts />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 