
import React, { useState, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Legend, LineChart, Line, BarChart, Bar, ReferenceLine, Cell, LabelList, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  ShieldAlert, 
  FileText, 
  Settings, 
  MessageSquare, 
  ChevronRight, 
  Info,
  ArrowUpRight,
  Calculator,
  Gavel,
  History,
  Coins,
  LayoutDashboard,
  Calendar,
  Wallet,
  Landmark,
  Zap,
  Clock
} from 'lucide-react';
import { NPLInputs } from './types';
import { calculateNPL, formatCurrency, formatPercent } from './utils/nplCalculator';
import { getGeminiConsultant } from './services/gemini';

const INITIAL_INPUTS: NPLInputs = {
  appraisal_price: 440000000,
  prev_min_bid_price: 308000000,
  curr_min_bid_price: 215600000,
  urgent_sale_price: 400000000, 
  expected_bid_rate: 85, 
  claim_amount: 480000000,
  max_mortgage_amount: 480000000,
  bond_purchase_price: 280000000,
  interest_rate: 8, 
  overdue_interest_rate: 20, 
  senior_takeover: 0,
  pledge_interest_cost: 0,
  target_roi: 20, 
  pledge_loan_rate: 70, 
  commencement_date: '2024-01-01',
  auction_date: '2024-10-01',
  distribution_date: '2025-01-01'
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<NPLInputs>(INITIAL_INPUTS);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isConsulting, setIsConsulting] = useState(false);

  const results = useMemo(() => calculateNPL(inputs), [inputs]);

  const handleInputChange = (key: keyof NPLInputs, value: string) => {
    if (key.includes('date')) {
      setInputs(prev => ({ ...prev, [key]: value }));
    } else {
      const numValue = value === '' ? 0 : parseFloat(value.replace(/,/g, ''));
      setInputs(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const defensiveBiddingData = [
    { name: '채권최고액', value: inputs.max_mortgage_amount, color: '#64748b' },
    { name: '원금추정', value: results.estimated_principal, color: '#94a3b8' },
    { name: 'NPL 매입가', value: inputs.bond_purchase_price, color: '#ef4444' },
    { name: '감정가', value: inputs.appraisal_price, color: '#3b82f6' },
    { name: '직전최저가', value: inputs.prev_min_bid_price, color: '#60a5fa' },
    { name: '최저가', value: inputs.curr_min_bid_price, color: '#93c5fd' },
    { name: '예상낙찰가', value: results.expected_bid_price, color: '#10b981' },
  ];

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatLog(prev => [...prev, { role: 'user', text: userText }]);
    setChatMessage('');
    setIsConsulting(true);

    const aiResponse = await getGeminiConsultant(inputs, results, userText);
    setChatLog(prev => [...prev, { role: 'ai', text: aiResponse || 'No response' }]);
    setIsConsulting(false);
  };

  const isDefensiveBidRequired = inputs.curr_min_bid_price < inputs.bond_purchase_price;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-full lg:w-96 bg-white border-r border-slate-200 overflow-y-auto max-h-screen sticky top-0 shadow-lg z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-900 text-white">
          <Landmark className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight">NPL Pro Simulator</h1>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 주요 기정일
            </h2>
            <div className="space-y-4">
              <InputGroup label="경매개시결정일" value={inputs.commencement_date as any} onChange={(v) => handleInputChange('commencement_date', v)} type="date" />
              <InputGroup label="경매기일" value={inputs.auction_date as any} onChange={(v) => handleInputChange('auction_date', v)} type="date" />
              <InputGroup label="배당기일" value={inputs.distribution_date as any} onChange={(v) => handleInputChange('distribution_date', v)} type="date" />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Gavel className="w-4 h-4" /> 경매 정보
            </h2>
            <div className="space-y-4">
              <InputGroup label="감정가" value={inputs.appraisal_price} onChange={(v) => handleInputChange('appraisal_price', v)} suffix="원" />
              <InputGroup label="급매가 (시세)" value={inputs.urgent_sale_price} onChange={(v) => handleInputChange('urgent_sale_price', v)} suffix="원" />
              <InputGroup label="직전최저가" value={inputs.prev_min_bid_price} onChange={(v) => handleInputChange('prev_min_bid_price', v)} suffix="원" />
              <InputGroup label="최저가" value={inputs.curr_min_bid_price} onChange={(v) => handleInputChange('curr_min_bid_price', v)} suffix="원" />
              <div className="space-y-1">
                <InputGroup label="예상 낙찰가율 (%)" value={inputs.expected_bid_rate} onChange={(v) => handleInputChange('expected_bid_rate', v)} suffix="%" type="number" />
                <div className="flex justify-between items-center px-4 py-2 bg-emerald-50 border border-emerald-200 border-dashed rounded-xl">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-wrap">예상낙찰가 (감정가 * %)</span>
                  <span className="text-xs font-black text-emerald-700">{formatCurrency(results.expected_bid_price)}</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 채권/매입 정보
            </h2>
            <div className="space-y-4">
              <InputGroup label="법원 신고 채권액" value={inputs.claim_amount} onChange={(v) => handleInputChange('claim_amount', v)} suffix="원" />
              <div className="space-y-1">
                <InputGroup label="근저당최고액" value={inputs.max_mortgage_amount} onChange={(v) => handleInputChange('max_mortgage_amount', v)} suffix="원" />
                <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl shadow-inner">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">원금추정 (÷1.2)</span>
                  <span className="text-xs font-black text-slate-600">{formatCurrency(results.estimated_principal)}</span>
                </div>
              </div>
              <InputGroup label="NPL 매입가" value={inputs.bond_purchase_price} onChange={(v) => handleInputChange('bond_purchase_price', v)} suffix="원" />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> 비용/이자/질권 설정
            </h2>
            <div className="space-y-4">
              <InputGroup label="선순위 인수금" value={inputs.senior_takeover} onChange={(v) => handleInputChange('senior_takeover', v)} suffix="원" />
              <InputGroup label="질권 이자 비용" value={inputs.pledge_interest_cost} onChange={(v) => handleInputChange('pledge_interest_cost', v)} suffix="원" />
              <InputGroup label="질권대출 비율 (%)" value={inputs.pledge_loan_rate} onChange={(v) => handleInputChange('pledge_loan_rate', v)} suffix="%" type="number" />
              <InputGroup label="연 이자율 (%)" value={inputs.interest_rate} onChange={(v) => handleInputChange('interest_rate', v)} suffix="%" type="number" />
              <InputGroup label="연체 이자율 (%)" value={inputs.overdue_interest_rate} onChange={(v) => handleInputChange('overdue_interest_rate', v)} suffix="%" type="number" />
              <InputGroup label="목표 ROI (%)" value={inputs.target_roi} onChange={(v) => handleInputChange('target_roi', v)} suffix="%" type="number" />
            </div>
          </section>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-blue-600" /> NPL 분석 보고서
            </h2>
            <p className="text-slate-500 text-sm font-medium">상세 재무 지표 및 방어 입찰 시나리오</p>
          </div>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm">
                <Calendar className="w-4 h-4" /> 배당기일: {inputs.distribution_date}
             </div>
          </div>
        </header>

        {results.risk_flags.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
            <ShieldAlert className="w-7 h-7 text-red-600 shrink-0" />
            <div>
              <h3 className="font-black text-red-800 text-lg leading-tight">주의 필요 리스크</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {results.risk_flags.map(flag => (
                  <span key={flag} className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-lg uppercase tracking-tight shadow-sm">
                    {flag.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Financial Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="미래배당차익" value={formatCurrency(results.future_distribution_gain)} icon={<TrendingUp className="text-blue-500" />} subtitle="최고액 - 원금추정" />
          <StatCard title="연체이자(연)" value={formatCurrency(results.overdue_interest)} icon={<History className="text-orange-500" />} subtitle="추정원금 * 연체율" />
          <StatCard title="질권대출금" value={formatCurrency(results.pledge_loan_amount)} icon={<Wallet className="text-indigo-500" />} subtitle="매입가 * 질권비율" />
          <StatCard title="최소투자금" value={formatCurrency(results.min_investment_amount)} icon={<Coins className="text-green-500" />} subtitle="매입가 - 질권대출금" />
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Defensive Bidding Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
                  <Gavel className="w-6 h-6 text-blue-600" /> 방어입찰 시나리오 분석
                </h3>
                <p className="text-sm text-slate-500 mt-1">경매 최저가와 채권 매입가 간의 안전 마진 변동성</p>
              </div>
              <div className={`px-6 py-3 rounded-2xl text-sm font-black border-2 transition-all ${isDefensiveBidRequired ? 'bg-red-50 border-red-200 text-red-700 shadow-red-100 shadow-lg' : 'bg-green-50 border-green-200 text-green-700'}`}>
                {isDefensiveBidRequired ? '🚨 방어입찰 필수 구간' : '✅ 안정적 마진 확보'}
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defensiveBiddingData} margin={{ top: 30, right: 30, left: 40, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    angle={-15} 
                    textAnchor="end" 
                    interval={0} 
                    height={60} 
                    tick={{ fontSize: 12, fontWeight: 800, fill: '#475569' }} 
                  />
                  <YAxis 
                    tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }}
                    axisLine={false}
                  />
                  <ReTooltip 
                    formatter={(v: number) => formatCurrency(v)} 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', padding: '15px' }}
                    itemStyle={{ fontWeight: 900, fontSize: '14px' }}
                  />
                  <ReferenceLine y={inputs.bond_purchase_price} stroke="#ef4444" strokeWidth={3} strokeDasharray="8 4" label={{ position: 'top', value: '매입가', fill: '#ef4444', fontSize: 10, fontWeight: 900 }} />
                  <ReferenceLine y={inputs.urgent_sale_price} stroke="#f59e0b" strokeWidth={3} strokeDasharray="8 4" label={{ position: 'top', value: '급매가', fill: '#f59e0b', fontSize: 10, fontWeight: 900 }} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                    {defensiveBiddingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      formatter={(v: number) => (v / 1000000).toFixed(1) + 'M'} 
                      style={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                      offset={10}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> NPL 매입가</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /> 급매가(시세)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> 예상낙찰가</div>
            </div>
          </div>

          {/* Timeline Bond Rights Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8">
            <div className="mb-8">
              <h3 className="font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
                <Clock className="w-6 h-6 text-indigo-600" /> 채권행사권리금액 (Timeline)
              </h3>
              <p className="text-sm text-slate-500 mt-1">시간 경과에 따른 연체이자 증가 및 채권최고액 도달 시점 분석</p>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.timeline_data} margin={{ top: 30, right: 30, left: 40, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 12, fontWeight: 800, fill: '#475569' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, inputs.max_mortgage_amount * 1.1]}
                    tickFormatter={(v) => (v / 1000000).toFixed(0) + 'M'} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReTooltip 
                    formatter={(v: number) => formatCurrency(v)} 
                    labelFormatter={(label, payload) => {
                      const data = payload[0]?.payload;
                      return `${label} (${data?.date})`;
                    }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', padding: '15px' }}
                    itemStyle={{ fontWeight: 900, fontSize: '14px', color: '#6366f1' }}
                  />
                  <ReferenceLine 
                    y={inputs.max_mortgage_amount} 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    label={{ position: 'right', value: '채권최고액 한도', fill: '#ef4444', fontSize: 10, fontWeight: 900 }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                    animationDuration={1500}
                  >
                    <LabelList 
                      dataKey="amount" 
                      position="top" 
                      formatter={(v: number) => (v / 1000000).toFixed(1) + 'M'} 
                      style={{ fontSize: 10, fontWeight: 900, fill: '#6366f1' }} 
                      offset={10}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-10">
               <div className="text-center">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">청구금액 (T0)</p>
                 <p className="text-sm font-black text-slate-800">{formatCurrency(inputs.claim_amount)}</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">배당 예상 권리금 (T2)</p>
                 <p className="text-sm font-black text-indigo-600">{formatCurrency(results.timeline_data[2].amount)}</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">최고액 도달 여부</p>
                 <p className="text-sm font-black text-red-600">
                   {results.timeline_data[2].amount >= inputs.max_mortgage_amount ? '한도 도달' : '한도 내 증가'}
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Strategy Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
              <h3 className="font-black text-xl flex items-center gap-3">
                <div className="w-3 h-8 bg-blue-600 rounded-full" /> 배당 투자 결과
              </h3>
              <div className="text-xs font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-lg">DISTRIBUTION</div>
            </div>
            <div className="p-8 space-y-5 flex-1">
              <ResultRow label="예상 배당금" value={formatCurrency(results.distribution_strategy.expected_distribution)} />
              <ResultRow label="총 부대비용" value={formatCurrency(results.incidental_cost_sum)} />
              <div className="pt-4 border-t border-slate-100">
                <ResultRow label="순수익" value={formatCurrency(results.distribution_strategy.profit)} highlight={results.distribution_strategy.profit > 0} />
                <ResultRow label="배당 ROI" value={formatPercent(results.distribution_strategy.roi)} highlight={results.distribution_strategy.roi > 0} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="font-black text-xl flex items-center gap-3">
                <div className="w-3 h-8 bg-indigo-600 rounded-full" /> 유입 투자 결과
              </h3>
              <div className="text-xs font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg">INFLOW</div>
            </div>
            <div className="p-8 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner group hover:bg-white transition-all cursor-default">
                  <p className="text-[11px] text-slate-400 font-black uppercase mb-2 tracking-widest">Case 1: 청구액</p>
                  <p className="text-base font-black text-slate-800">{formatCurrency(results.inflow_strategy.profit_case_claim)}</p>
                  <p className="text-sm text-indigo-600 font-black mt-1">{formatPercent(results.inflow_strategy.roi_case_claim)} ROI</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner group hover:bg-white transition-all cursor-default">
                  <p className="text-[11px] text-slate-400 font-black uppercase mb-2 tracking-widest">Case 2: 최고액</p>
                  <p className="text-base font-black text-slate-800">{formatCurrency(results.inflow_strategy.profit_case_max_mortgage)}</p>
                  <p className="text-sm text-indigo-600 font-black mt-1">{formatPercent(results.inflow_strategy.roi_case_max_mortgage)} ROI</p>
                </div>
                <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 shadow-inner group hover:bg-white transition-all cursor-default">
                  <p className="text-[11px] text-amber-500 font-black uppercase mb-2 tracking-widest">Case 3: 급매가</p>
                  <p className="text-base font-black text-slate-800">{formatCurrency(results.inflow_strategy.profit_case_urgent_sale)}</p>
                  <p className="text-sm text-amber-600 font-black mt-1">{formatPercent(results.inflow_strategy.roi_case_urgent_sale)} ROI</p>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <ResultRow label="추정 투자기간" value={`${results.inflow_strategy.expected_period.toFixed(1)}년`} />
                <ResultRow label="원금 추정액" value={formatCurrency(results.estimated_principal)} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Section */}
        <section className="bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl border border-slate-800 relative group">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 to-slate-900">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <MessageSquare className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-white text-2xl font-black tracking-tight">NPL AI 전략 매니저</h3>
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mt-1">Institutional Investment Advisor</p>
              </div>
            </div>
          </div>
          
          <div className="h-[450px] overflow-y-auto p-10 space-y-8 bg-slate-950/20 scroll-smooth">
            {chatLog.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center border border-slate-700">
                   <Landmark className="w-10 h-10 text-slate-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-300 text-lg font-bold">전략적 의사결정을 지원합니다</p>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
                    질권대출 및 최소투자금을 고려한 자본 효율성 분석과 방어입찰 시점을 AI에게 물어보세요.
                  </p>
                </div>
              </div>
            )}
            {chatLog.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-7 py-5 rounded-[32px] text-sm leading-relaxed shadow-2xl ${
                  chat.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}
            {isConsulting && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-blue-400 px-6 py-4 rounded-[24px] animate-pulse text-xs font-black border border-slate-700 tracking-wider">
                  AI IS ANALYZING NPL SCENARIOS...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleConsult} className="p-8 bg-slate-900 border-t border-slate-800 flex gap-5">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="전략적 질문을 입력하세요 (예: 질권대출 활용 시 수익률 변화는?)"
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-3xl px-7 py-5 text-white placeholder-slate-600 focus:ring-4 focus:ring-blue-600/30 outline-none transition-all font-medium text-base shadow-inner"
            />
            <button disabled={isConsulting} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-10 py-5 rounded-3xl font-black transition-all flex items-center gap-3 shadow-2xl shadow-blue-600/20 active:scale-95 text-lg">
              상담하기 <ChevronRight className="w-6 h-6" />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

const InputGroup: React.FC<{ label: string; value: number | string; onChange: (v: string) => void; suffix?: string; type?: string; step?: string; }> = ({ label, value, onChange, suffix, type = "text", step }) => {
  const displayValue = type === "text" && typeof value === 'number' ? value.toLocaleString() : value;
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-slate-500 ml-1 uppercase tracking-widest">{label}</label>
      <div className="relative group">
        <input 
          type={type} 
          step={step} 
          value={displayValue} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-slate-800 group-hover:bg-white shadow-sm" 
        />
        {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 pointer-events-none">{suffix}</span>}
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string; value: string; icon: React.ReactNode; subtitle?: string}> = ({title, value, icon, subtitle}) => (
  <div className="bg-white p-7 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-500 group">
    <div className="flex justify-between items-start mb-4">
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">{title}</span>
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors shadow-sm">{icon}</div>
    </div>
    <div className="text-xl font-black text-slate-800 tracking-tight leading-tight">{value}</div>
    {subtitle && <p className="text-[11px] text-slate-400 mt-2 font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100">{subtitle}</p>}
  </div>
);

const ResultRow: React.FC<{label: string; value: string; highlight?: boolean}> = ({label, value, highlight}) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
    <span className="text-slate-500 text-sm font-bold tracking-tight">{label}</span>
    <span className={`font-black text-lg ${highlight ? 'text-blue-600' : 'text-slate-800'}`}>{value}</span>
  </div>
);

export default App;
