import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pin, Eye, MousePointer, AlertCircle, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/Toast';

const Dashboard: React.FC = () => {
  const { queue, loading, getStats } = useAppStore();
  const { addToast } = useToast();
  const stats = getStats();

  // Generate dynamic chart data for the last 7 days
  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      
      // Aggregate stats for this day from queue items (mocking impression logic based on publish date)
      // In a real app, we would query an 'analytics' table. Here we estimate based on queue items.
      const dayItems = queue.filter(item => {
        if (!item.published_at) return false;
        return item.published_at.startsWith(dateStr);
      });

      // Adding some randomness to mock historical data if queue is small, 
      // ensuring the chart isn't empty for the demo.
      const baseImpressions = dayItems.length * 1000; 
      const baseClicks = dayItems.length * 50;

      days.push({
        name: dayName,
        date: dateStr,
        impressions: baseImpressions + Math.floor(Math.random() * 500), // Noise for demo
        clicks: baseClicks + Math.floor(Math.random() * 50)
      });
    }
    return days;
  }, [queue]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(queue, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "nutrizen_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    addToast("Rapport exporté avec succès", "success");
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Chargement du tableau de bord...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500">Aperçu des performances de votre automatisation Pinterest.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleExport}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
                Exporter Rapport
            </button>
            <button 
                onClick={() => window.location.hash = '#/recipes'}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors"
            >
                + Nouveau Pin
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Impressions Totales" 
          value={stats.totalImpressions.toLocaleString()} 
          icon={Eye} 
          trend="+12.5%" 
          trendUp={true} 
        />
        <StatCard 
          title="Clics Totaux" 
          value={stats.totalClicks.toLocaleString()} 
          icon={MousePointer} 
          trend="+8.2%" 
          trendUp={true} 
        />
        <StatCard 
          title="Pins Planifiés" 
          value={stats.scheduled} 
          icon={Clock} 
          colorClass="bg-blue-50 border-blue-100"
        />
        <StatCard 
          title="Échecs de Publication" 
          value={stats.errors} 
          icon={AlertCircle} 
          trend={stats.errors > 0 ? "Action Requise" : "Tout va bien"}
          trendUp={stats.errors === 0}
          colorClass={stats.errors > 0 ? "bg-red-50 border-red-100" : "bg-white"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tendances (7 derniers jours)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="impressions" name="Impressions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="clicks" name="Clics" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">État de la File</h3>
          <div className="space-y-4 flex-1">
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-slate-700">Publié</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{stats.published}</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-slate-700">Planifié</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{stats.scheduled}</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-slate-700">En attente</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{queue.filter(q => q.status === 'pending').length}</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-slate-700">Erreurs</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{stats.errors}</span>
             </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-medium text-slate-500 mb-3">Activité Récente</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {queue.slice(0, 5).map(item => (
                    <div key={item.id} className="flex items-start gap-3">
                        <img src={item.image_path} alt="" className="w-10 h-10 rounded object-cover" />
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 line-clamp-1">{item.pin_title}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{item.status}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;