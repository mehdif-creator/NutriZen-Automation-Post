import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pin, Eye, MousePointer, AlertCircle, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { dbService } from '../services/mockSupabase';
import { SocialQueueItem, DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [queue, setQueue] = useState<SocialQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dbService.getQueue();
      setQueue(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Calculate stats from queue data
  const stats: DashboardStats = {
    totalPins: queue.length,
    published: queue.filter(i => i.status === 'posted').length,
    scheduled: queue.filter(i => i.status === 'scheduled').length,
    errors: queue.filter(i => i.status === 'error').length,
    totalClicks: queue.reduce((acc, curr) => acc + curr.utm_stats.clicks, 0),
    totalImpressions: queue.reduce((acc, curr) => acc + curr.utm_stats.impressions, 0),
  };

  const chartData = [
    { name: 'Lun', impressions: 4000, clicks: 240 },
    { name: 'Mar', impressions: 3000, clicks: 139 },
    { name: 'Mer', impressions: 2000, clicks: 980 },
    { name: 'Jeu', impressions: 2780, clicks: 390 },
    { name: 'Ven', impressions: 1890, clicks: 480 },
    { name: 'Sam', impressions: 2390, clicks: 380 },
    { name: 'Dim', impressions: 3490, clicks: 430 },
  ];

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement du tableau de bord...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500">Aperçu des performances de votre automatisation Pinterest.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Exporter Rapport
            </button>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm">
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
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tendances de Performance</h3>
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
                <Bar dataKey="impressions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">État de la File</h3>
          <div className="space-y-4">
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
            <div className="space-y-3">
                {queue.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-start gap-3">
                        <img src={item.image_path} alt="" className="w-10 h-10 rounded object-cover" />
                        <div>
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