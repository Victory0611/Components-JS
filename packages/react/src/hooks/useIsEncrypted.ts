import * as React from 'react';
import { LocalParticipant } from 'livekit-client';
import { encryptionStatusObservable } from '@livekit/components-core';
import { useEnsureParticipant, useEnsureRoom } from '../context';
import { useObservableState } from './internal';

/**
 * @alpha
 */
export function useIsEncrypted() {
  const p = useEnsureParticipant();
  const room = useEnsureRoom();

  const observer = React.useMemo(() => encryptionStatusObservable(room, p), [room, p]);
  const isEncrypted = useObservableState(
    observer,
    p instanceof LocalParticipant ? p.isE2EEEnabled : p.isEncrypted,
  );
  return isEncrypted;
}
