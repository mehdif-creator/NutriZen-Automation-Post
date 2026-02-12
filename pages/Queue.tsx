import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/Toast';
import { pinService } from '../services/pinPublishingService';
import { Filter, Calendar, ExternalLink, RefreshCw, Trash2, Edit, Loader2 } from 'lucide-react';
import { SocialQueueItem } from '../types';

const Queue: React.FC = () => {
  const { queue, removeFromQueue, updateQueueStatus } = useAppStore();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRetry = async (item: SocialQueueItem) => {
    setProcessingId(item.id);
    try {
        await updateQueueStatus(item.id, 'pending'); // Reset to pending
        await pinService.publishPin(item); // Try publishing
        addToast("Publication réussie !", "success");
    } catch (error: any) {
        addToast(`Erreur de publication: ${error.message}`, "error");
    } finally {
        setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément de la file ?")) {
        try {
            await removeFromQueue(id);
            addToast("Élément supprimé", "success");
        } catch (e) {
            addToast("Erreur lors de la suppression", "error");
        }
    }
  };

  const filteredItems = filter === 'all' 
    ? queue 
    : queue.filter(item => item.status === filter);

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'posted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'error': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
        case 'posted': return 'Publié';
        case 'scheduled': return 'Planifié';
        case 'pending': return 'En attente';
        case 'error': return 'Erreur';
        default: return status;
    }
  };

  const getFilterLabel = (f: string) => {
     if (f === 'all') return 'Tous';
     return getStatusLabel(f);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">File d'attente</h1>
           <p className="text-slate-500">Gérez, planifiez et surveillez vos pins automatisés.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            {['all', 'pending', 'scheduled', 'posted', 'error'].map(f => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                        filter === f ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    {getFilterLabel(f)}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="px-6 py-4">Contenu</th>
                        <th className="px-6 py-4">Tableau & Données</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4">Programmation</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-12 flex-shrink-0 rounded-md bg-slate-100 overflow-hidden border border-slate-200">
                                        <img src={item.image_path} alt={item.pin_title} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{item.pin_title}</p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.pin_description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                                {item.platform}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-700">Tableau: <span className="text-emerald-600">{item.board_slug}</span></p>
                                    <p className="text-xs text-slate-500 truncate max-w-[200px]" title={item.destination_url}>
                                        {item.destination_url.replace('https://nutrizen.app', '...')}
                                    </p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                    {getStatusLabel(item.status)}
                                </span>
                                {item.error_message && (
                                    <p className="text-xs text-red-500 mt-1 max-w-[150px]">{item.error_message}</p>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {item.status === 'posted' ? (
                                        <span>{new Date(item.published_at!).toLocaleDateString('fr-FR')}</span>
                                    ) : item.scheduled_at ? (
                                        <span>{new Date(item.scheduled_at).toLocaleDateString('fr-FR')} <span className="text-xs text-slate-400">{new Date(item.scheduled_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span></span>
                                    ) : (
                                        <span className="text-slate-400 italic">Non planifié</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {/* Action Buttons */}
                                    {processingId === item.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                    ) : (
                                        <>
                                            {item.status === 'error' && (
                                                <button 
                                                    onClick={() => handleRetry(item)}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                                    title="Réessayer"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            )}
                                            {item.status === 'posted' && (
                                                <a href="#" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Voir sur Pinterest">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="Modifier">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {filteredItems.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-medium">Aucun élément trouvé</h3>
                    <p className="text-slate-500 text-sm mt-1">Essayez de changer le filtre ou ajoutez du contenu.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Queue;