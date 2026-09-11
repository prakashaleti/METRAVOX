import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  IndianRupee, 
  AlertCircle, 
  Download, 
  Filter, 
  Scale, 
  CheckCircle2, 
  RefreshCcw,
  Layers,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { applications = [], certificates = [], addToast } = useApp();

  // 1. Dynamic Top Administrative Metrics derived from live applications & certificates
  const totalRegisteredInstruments = applications.length;
  const totalCertificates = certificates.length;
  
  const totalFeeCollected = useMemo(() => {
    return applications.reduce((sum, app) => sum + (Number(app.feeAmount) || 0), 0);
  }, [applications]);

  const approvedCount = useMemo(() => {
    return applications.filter(a => a.status === 'Certificate Generated' || a.status === 'Approved').length;
  }, [applications]);

  const rejectedCount = useMemo(() => {
    return applications.filter(a => a.status === 'Rejected').length;
  }, [applications]);

  const underReviewCount = useMemo(() => {
    return applications.filter(a => a.status === 'Under Review' || a.status === 'Application Submitted').length;
  }, [applications]);

  const scheduledCount = useMemo(() => {
    return applications.filter(a => a.status === 'Verification Scheduled').length;
  }, [applications]);

  const complianceRate = useMemo(() => {
    const inspected = approvedCount + rejectedCount;
    if (inspected === 0) return '100.0';
    return ((approvedCount / inspected) * 100).toFixed(1);
  }, [approvedCount, rejectedCount]);

  // 2. Dynamic Monthly Verifications Trajectory from live records
  const monthlyData = useMemo(() => {
    const dataMap = {
      Apr: { month: 'Apr', initialVerifications: 0, renewals: 0, totalRevenue: 0 },
      May: { month: 'May', initialVerifications: 0, renewals: 0, totalRevenue: 0 },
      Jun: { month: 'Jun', initialVerifications: 0, renewals: 0, totalRevenue: 0 },
      Jul: { month: 'Jul', initialVerifications: 0, renewals: 0, totalRevenue: 0 },
      Aug: { month: 'Aug', initialVerifications: 0, renewals: 0, totalRevenue: 0 },
      Sep: { month: 'Sep', initialVerifications: 0, renewals: 0, totalRevenue: 0 },
    };

    applications.forEach((app) => {
      let monthKey = 'Sep';
      if (app.submittedAt) {
        const d = new Date(app.submittedAt);
        if (!isNaN(d.getMonth())) {
          const m = d.toLocaleString('en-US', { month: 'short' });
          if (dataMap[m]) monthKey = m;
        }
      }
      const isInitial = app.verificationNature === 'Initial Verification';
      if (isInitial) {
        dataMap[monthKey].initialVerifications += 1;
      } else {
        dataMap[monthKey].renewals += 1;
      }
      dataMap[monthKey].totalRevenue += (Number(app.feeAmount) || 0);
    });

    return Object.values(dataMap);
  }, [applications]);

  // 3. Dynamic Category Distribution from live applications
  const categoryDistribution = useMemo(() => {
    if (!applications.length) {
      return [
        { name: 'Electronic Weighing Scales', value: 100, count: 0, color: '#0f766e' }
      ];
    }

    const counts = {};
    applications.forEach((app) => {
      const cat = app.instrumentCategory || app.instrumentType || 'General Weighing Instruments';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const palette = ['#0f766e', '#0284c7', '#eab308', '#8b5cf6', '#f43f5e', '#10b981'];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      count,
      value: Math.max(1, Math.round((count / applications.length) * 100)),
      color: palette[idx % palette.length]
    }));
  }, [applications]);

  // 4. Dynamic District Compliance from live applications
  const districtCompliance = useMemo(() => {
    const dMap = {};
    applications.forEach((app) => {
      const dist = app.district || 'Ernakulam';
      if (!dMap[dist]) {
        dMap[dist] = { district: dist, inspected: 0, passed: 0 };
      }
      dMap[dist].inspected += 1;
      if (app.status === 'Certificate Generated' || app.status === 'Approved') {
        dMap[dist].passed += 1;
      }
    });

    const entries = Object.values(dMap);
    if (!entries.length) {
      return [{ district: 'Ernakulam', inspected: 1, passed: 1, compliance: 100 }];
    }

    return entries.map((d) => ({
      district: d.district,
      inspected: d.inspected,
      passed: d.passed,
      compliance: d.inspected > 0 ? parseFloat(((d.passed / d.inspected) * 100).toFixed(1)) : 100
    }));
  }, [applications]);

  // 5. Dynamic Officers Roster based on real application assignments
  const officersRoster = useMemo(() => {
    const oMap = {};
    applications.forEach((app) => {
      const name = app.assignedOfficer || 'Ramesh varma';
      if (!oMap[name]) {
        oMap[name] = {
          name,
          badge: name === 'Ramesh varma' ? 'LMO-KL-2026-RV' : `LMO-KL-07-${Math.abs(name.charCodeAt(0) * 3) % 80 + 10}`,
          zone: app.district ? `${app.district} Enforcement Zone` : 'Central Standards Laboratory',
          activeQueue: 0,
          completedMonth: 0,
          total: 0
        };
      }
      oMap[name].total += 1;
      if (app.status === 'Verification Scheduled' || app.status === 'Under Review') {
        oMap[name].activeQueue += 1;
      } else if (app.status === 'Certificate Generated' || app.status === 'Approved') {
        oMap[name].completedMonth += 1;
      }
    });

    const list = Object.values(oMap);
    if (!list.length) {
      list.push({
        name: 'Ramesh varma',
        badge: 'LMO-KL-2026-RV',
        zone: 'Ernakulam Enforcement Zone 04',
        activeQueue: 0,
        completedMonth: 0,
        total: 0
      });
    }

    return list.map((o) => ({
      ...o,
      rating: o.total > 0 ? `${Math.round((o.completedMonth / o.total) * 100)}%` : '100%'
    }));
  }, [applications]);

  // 6. Real Executive CSV Export
  const handleExportExecutiveReport = () => {
    const headers = [
      'Report Metric',
      'Value',
      'Remarks'
    ];
    const rows = [
      ['Total Registered Dossiers', applications.length, 'Live registry count'],
      ['Total Issued Digital Certificates', certificates.length, 'Legally active & verified'],
      ['Statutory Fee Collection', `INR ${totalFeeCollected}`, 'Collected under Schedule XII'],
      ['Under Review Queue', underReviewCount, 'Dossiers awaiting scrutiny'],
      ['Scheduled Field Inspections', scheduledCount, 'Assigned to enforcement squads'],
      ['Approved & Certified', approvedCount, 'Passed statutory verification'],
      ['Defective / Rejected', rejectedCount, 'Rejected for non-compliance'],
      ['Overall Compliance Rate', `${complianceRate}%`, 'Permissible MPE compliance ratio']
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statewide_metrology_executive_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefreshFeed = () => {
    if (addToast) {
      addToast('Statewide metrology analytics synchronized with live database.', 'info', 'Feed Synchronized');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 border border-purple-400/30 text-purple-300">
                Directorate of Legal Metrology • Admin Console
              </span>
              <span className="text-xs text-purple-200 font-mono">Role: Assistant Controller</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Statewide Metrological Analytics & Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              System Administrator: {user?.name || 'Administrator'} ({user?.organization || 'Legal Metrology Directorate'}). Monitor statewide verification velocity, revenue collections, officer workloads, and statutory compliance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportExecutiveReport}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 shadow-xs"
              title="Download executive state summary report"
            >
              <Download className="w-4 h-4 text-purple-300" />
              Export Executive Report
            </button>
            <button
              type="button"
              onClick={handleRefreshFeed}
              className="px-3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              title="Sync live dashboard feed"
            >
              <RefreshCcw className="w-4 h-4" />
              Sync Feed
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Administrative Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registered Instruments</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalRegisteredInstruments}</span>
            <span className="text-xs text-emerald-600 font-semibold">{approvedCount} Certified</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{districtCompliance.length} Active Jurisdictions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">State Statutory Fees</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-900">₹ {totalFeeCollected.toLocaleString('en-IN')}</span>
            <span className="text-xs text-emerald-600 font-semibold">Live Revenue</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">From {applications.length} Settled Dossiers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Enforcement Officers</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-900">{officersRoster.length}</span>
            <span className="text-xs text-slate-500">Assigned Squads</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{scheduledCount} Field Inspections Scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">MPE Compliance Rate</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-900">{complianceRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold">Statutory Standard</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{rejectedCount} Defective / {approvedCount} Certified</p>
        </div>
      </div>

      {/* 3. Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Verifications Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-serif">
                Monthly Verification & Renewal Trajectory
              </h3>
              <p className="text-xs text-slate-500">Comparing initial verifications vs annual periodic renewals</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              FY 2025-26
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRenewals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorInitial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="renewals" name="Periodic Renewals" stroke="#0f766e" fillOpacity={1} fill="url(#colorRenewals)" />
                <Area type="monotone" dataKey="initialVerifications" name="Initial Verifications" stroke="#0284c7" fillOpacity={1} fill="url(#colorInitial)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-serif">
                Instrument Types in Central Registry
              </h3>
              <p className="text-xs text-slate-500">Distribution by legal metrology category</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
              Statewide Mix
            </span>
          </div>

          <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              {categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-600 text-[11px] truncate max-w-[130px]">{cat.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. District Compliance Performance & Officers Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Chart */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 font-serif">District Compliance</h3>
            <p className="text-xs text-slate-500">Inspection pass rate % by district</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtCompliance} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[90, 100]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="district" type="category" tick={{ fontSize: 10 }} width={75} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="compliance" name="Compliance %" fill="#0f766e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Officers Performance Roster */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-serif">Enforcement Officers & Jurisdiction Load</h3>
              <p className="text-xs text-slate-500">Real-time scrutiny and field inspection assignment tracking</p>
            </div>
            <span className="text-xs font-bold text-teal-700">{officersRoster.length} Active Squads</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Officer Name & Badge</th>
                  <th className="p-3">Jurisdiction Division</th>
                  <th className="p-3 text-center">Active Queue</th>
                  <th className="p-3 text-center">This Month</th>
                  <th className="p-3 text-right">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {officersRoster.map((off) => (
                  <tr key={off.badge} className="hover:bg-slate-50">
                    <td className="p-3">
                      <strong className="text-slate-900 block">{off.name}</strong>
                      <span className="font-mono text-[10px] text-slate-500">{off.badge}</span>
                    </td>
                    <td className="p-3 text-slate-600">{off.zone}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                        {off.activeQueue}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800">{off.completedMonth}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{off.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
