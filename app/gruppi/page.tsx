'use client';

import { useState, useTransition, useEffect } from 'react';
import toast from 'react-hot-toast';
import GroupFormModal from '@/components/groups/GroupFormModal';
import GroupCard from '@/components/groups/GroupCard';
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
            <GroupCard
              key={group.id}
              group={group}
              isPending={isPending}
              onEdit={(g) => setModalState({ open: true, group: g })}
              onDelete={handleDelete}
            />
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
