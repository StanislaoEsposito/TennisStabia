'use client';

import { useState, useTransition, useEffect } from 'react';
import toast from 'react-hot-toast';
import AddGroupModal from '@/components/groups/AddGroupModal';
import { getGroups, deleteGroup } from '@/actions/groups';
import type { Group } from '@/lib/types';

export default function GruppiPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Carica i gruppi
  function loadGroups() {
    startTransition(async () => {
      try {
        const data = await getGroups();
        setGroups(data);
      } catch (err) {
        toast.error('Errore nel caricamento dei gruppi');
      }
    });
  }

  useEffect(() => {
    loadGroups();
  }, []);

  function handleDelete(group: Group) {
    if (!confirm(`Eliminare il gruppo "${group.name}"? Tutti gli allievi associati perderanno il gruppo.`)) return;
    startTransition(async () => {
      try {
        await deleteGroup(group.id);
        toast.success(`Gruppo "${group.name}" eliminato`);
        loadGroups();
      } catch (err) {
        toast.error('Errore: ' + (err instanceof Error ? err.message : 'Riprova'));
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🏅 Gestione Gruppi</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {groups.length} {groups.length === 1 ? 'gruppo attivo' : 'gruppi attivi'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary self-start sm:self-auto"
        >
          + Nuovo Gruppo
        </button>
      </div>

      {/* Lista gruppi */}
      {isPending && groups.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Caricamento…</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🎾</p>
          <p>Nessun gruppo creato. Inizia aggiungendone uno!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4"
            >
              {/* Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-800 font-bold text-sm">
                    {group.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-base">{group.name}</p>
                  {group.schedule_description ? (
                    <p className="text-sm text-slate-500 truncate">{group.schedule_description}</p>
                  ) : (
                    <p className="text-sm text-slate-300 italic">Nessun orario impostato</p>
                  )}
                </div>
              </div>

              {/* Azioni */}
              <button
                onClick={() => handleDelete(group)}
                disabled={isPending}
                aria-label={`Elimina gruppo ${group.name}`}
                className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
              >
                {/* Trash icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddGroupModal
          onClose={() => {
            setShowModal(false);
            loadGroups(); // Ricarica dopo la creazione
          }}
        />
      )}
    </div>
  );
}
