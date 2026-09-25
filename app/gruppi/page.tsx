'use client';

import { useState, useTransition, useEffect } from 'react';
import toast from 'react-hot-toast';
import GroupFormModal from '@/components/groups/GroupFormModal';
import { getGroups, deleteGroup } from '@/actions/groups';
import type { Group } from '@/lib/types';

function PencilIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

export default function GruppiPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalState, setModalState] = useState<{ open: boolean; group?: Group }>({ open: false });
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
          onClick={() => setModalState({ open: true })}
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
                  {group.schedule_data && group.schedule_data.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {group.schedule_data.map((slot, i) => (
                        <span
                          key={i}
                          className="inline-block rounded-md bg-green-50 border border-green-200 px-2 py-0.5 text-xs text-green-800 font-medium"
                        >
                          {slot.day.slice(0, 3)} {slot.time}
                        </span>
                      ))}
                    </div>
                  ) : group.schedule_description ? (
                    <p className="text-sm text-slate-500 truncate mt-0.5">{group.schedule_description}</p>
                  ) : (
                    <p className="text-sm text-slate-300 italic mt-0.5">Nessun orario impostato</p>
                  )}
                </div>
              </div>

              {/* Azioni */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setModalState({ open: true, group })}
                  disabled={isPending}
                  aria-label={`Modifica gruppo ${group.name}`}
                  className="flex-shrink-0 p-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-40"
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={() => handleDelete(group)}
                  disabled={isPending}
                  aria-label={`Elimina gruppo ${group.name}`}
                  className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalState.open && (
        <GroupFormModal
          group={modalState.group}
          onClose={() => {
            setModalState({ open: false });
            loadGroups(); // Ricarica dopo creazione/modifica
          }}
        />
      )}
    </div>
  );
}
