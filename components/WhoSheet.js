'use client';
import { PARENTS } from '@/lib/constants';
import Sheet from './Sheet';
import { PersonPick } from './ui';

export default function WhoSheet({ open, me, onPick, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="¿Quién eres?">
      <PersonPick options={PARENTS} value={me} onChange={(v) => { if (v) { onPick(v); onClose(); } }} />
    </Sheet>
  );
}
