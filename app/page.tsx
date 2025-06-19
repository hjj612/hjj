import { Suspense } from 'react';
import TickerTapeWidget from '../components/TickerTapeWidget';
import ForexHeatmap from '../components/ForexHeatmap';
import ForexChatbot from '../components/ForexChatbot';
import ForexAutoUpdaterWrapper from '../components/ForexAutoUpdaterWrapper';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <ForexAutoUpdaterWrapper />
      
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center h-16 px-4">
            <div className="flex items-center text-sm sm:text-lg overflow-hidden">
              <span className="text-[#666666] font-medium">groqlabs</span>
              <span className="text-[#666666] mx-1 sm:mx-2">/</span>
              <span className="text-black font-medium truncate">Korea Forex Bot</span>
              <span className="text-[#666666] mx-1 sm:mx-2 hidden sm:inline">/</span>

              <Link 
                href="#" 
                className="text-[#ff4b4b] hover:text-[#ff6b6b] transition-colors hidden sm:inline"
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

      <div className="flex-1 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-8">
            <div className="lg:col-span-7 order-1 lg:order-1">
              <div className="sm:mt-[60px] sm:ml-[-60px] transform hover:scale-[1.02] transition-transform duration-300">
                <div className="rounded-xl sm:rounded-2xl shadow-lg sm:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] bg-white/90 backdrop-blur-sm border border-blue-100/50">
                  <ForexChatbot />
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 order-2 lg:order-2">
              <div className="w-full h-[350px] sm:h-[400px] overflow-hidden sm:ml-[60px] sm:mt-[60px] transform hover:scale-[1.02] transition-transform duration-300">
                <div className="rounded-xl sm:rounded-2xl shadow-lg sm:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] bg-white/90 backdrop-blur-sm border border-blue-100/50">
                  <ForexHeatmap />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 