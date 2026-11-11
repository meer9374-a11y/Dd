"use client";

import React, { useState, useEffect } from "react";
import { Activity, Globe, RefreshCw, Cpu, Ship, Newspaper, Clock, ArrowUpRight, Radio } from "lucide-react";

interface Assessment {
  pair_id: string;
  pair_name: string;
  war_probability_30d: number;
  alert_level: "NORMAL" | "ELEVATED" | "HIGH" | "CRITICAL";
  decoupling_detected: boolean;
  primary_financial_trigger: string;
  early_warning_lead_time: string;
}

interface DashboardData {
  timestamp_utc: string;
  global_stress_index: number;
  global_baseline?: { supply_chain_macro?: { dram_spot_trend: string; shipping_stress_z: number } };
  osint_recent_crisis_news?: { title: string; published: string }[];
  assessments: Assessment[];
}

export default function GeoAlphaCommandCenter() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Vercel 배포 시 public 폴더에 있는 JSON을 직접 불러옵니다.
      const res = await fetch("/live_war_probabilities.json");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("데이터 로드 실패, 기본 모의 데이터를 표시합니다.", err);
      setData({
        timestamp_utc: new Date().toISOString(),
        global_stress_index: 44.2,
        global_baseline: {
          supply_chain_macro: { dram_spot_trend: "BULLISH_SPIKE", shipping_stress_z: 2.1 }
        },
        osint_recent_crisis_news: [
          { title: "Naval exercises intensified in the Western Pacific region", published: new Date().toISOString() },
          { title: "Semiconductor supply chain caution rises amid logistics shifts", published: new Date().toISOString() }
        ],
        assessments: [
          {
            pair_id: "1_US_CHINA_TAIWAN",
            pair_name: "미국-중국 (대만 해협)",
            war_probability_30d: 29.5,
            alert_level: "HIGH",
            decoupling_detected: true,
            primary_financial_trigger: "SOXX 반도체 지수 대비 TSM 역외 환율 급락 및 자본 이탈 포착 (Z-Score +2.4)",
            early_warning_lead_time: "정부 발표 대비 48시간 선행"
          },
          {
            pair_id: "2_SOUTH_NORTH_KOREA",
            pair_name: "대한민국-북한 (한반도)",
            war_probability_30d: 18.4,
            alert_level: "ELEVATED",
            decoupling_detected: false,
            primary_financial_trigger: "원달러 환율 변동성 확대 및 외국인 자금 순매도 심화",
            early_warning_lead_time: "정부 발표 대비 24시간 선행"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data?.assessments.filter(item => {
    const matchesFilter = selectedFilter === "ALL" || item.alert_level === selectedFilter;
    const matchesSearch = item.pair_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.primary_financial_trigger.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  const supplyMacro = data?.global_baseline?.supply_chain_macro;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono selection:bg-cyan-500 selection:text-black">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs tracking-widest uppercase mb-1">
            <Radio className="w-4 h-4 animate-pulse text-cyan-400" />
            Palantir-Aladdin Pro // GeoAlpha Command Center
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-cyan-500" />
            Global Geopolitical Risk Telemetry
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-inner">
          <div className="text-right">
            <div className="text-xs text-slate-400">GLOBAL STRESS INDEX</div>
            <div className="text-2xl font-black text-cyan-400">
              {data ? data.global_stress_index.toFixed(1) : "--"} <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <button onClick={fetchData} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition border border-slate-700">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </header>

      {/* Supply Chain Macro Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400"><Cpu className="w-5 h-5" /></div>
            <div>
              <div className="text-xs text-slate-400">반도체 현물가 동향 (DRAMeXchange)</div>
              <div className="text-sm font-bold text-white">{supplyMacro?.dram_spot_trend || "STABLE"}</div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded border font-semibold bg-emerald-950 text-emerald-400 border-emerald-800">정상 범위</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950 border border-blue-800 rounded-lg text-blue-400"><Ship className="w-5 h-5" /></div>
            <div>
              <div className="text-xs text-slate-400">해상 운임 스트레스 지수 (BDRY Z-Score)</div>
              <div className="text-sm font-bold text-white">Z = {supplyMacro?.shipping_stress_z ?? 0.0}σ</div>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded border font-semibold bg-slate-800 text-slate-300 border-slate-700">안정</span>
        </div>
      </div>

      {/* Main Grid: Dyads & OSINT Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            {["ALL", "CRITICAL", "HIGH", "ELEVATED", "NORMAL"].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedFilter(level)}
                className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${selectedFilter === level ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold" : "bg-slate-900 text-slate-400 border-slate-800"}`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div key={item.pair_id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className={`absolute top-0 left-0 right-0 h-1 ${item.alert_level === 'CRITICAL' ? 'bg-red-600' : item.alert_level === 'HIGH' ? 'bg-orange-500' : 'bg-cyan-500'}`} />
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded border font-bold uppercase">{item.alert_level}</span>
                    {item.decoupling_detected && <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">DECIPHERED</span>}
                  </div>
                  <h2 className="text-base font-bold text-white mb-2">{item.pair_name}</h2>
                  <div className="my-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">30일 내 충돌 확률</span>
                      <span className="font-bold text-cyan-400">{item.war_probability_30d.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${Math.min(item.war_probability_30d * 2, 100)}%` }} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded border border-slate-800/50">
                    <span className="text-cyan-400 font-semibold block mb-1">⚡ 트리거:</span>{item.primary_financial_trigger}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
                  <span>{item.early_warning_lead_time}</span>
                  <span>{item.pair_id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OSINT Ticker */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col h-fit sticky top-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Newspaper className="w-4 h-4 text-cyan-400" />OSINT Live Ticker</h2>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded animate-pulse">LIVE</span>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {data?.osint_recent_crisis_news?.map((news, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg">
                <p className="text-xs text-slate-200 mb-2 leading-relaxed">{news.title}</p>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{new Date(news.published).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
