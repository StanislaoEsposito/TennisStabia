'use client';

import { useState } from 'react';
import type { Group } from '@/lib/types';
import AddStudentModal from './AddStudentModal';

interface AddStudentButtonProps {
  groups: Group[];
}

export default function AddStudentButton({ groups }: AddStudentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        ➕ Aggiungi Allievo
      </button>

      {open && (
        <AddStudentModal groups={groups} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
