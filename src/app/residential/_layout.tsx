import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { getPersonaAsync, type Persona } from '@/lib/persona';

export default function ResidentialLayout() {
  const [persona, setPersona] = useState<Persona | null>(null);

  useEffect(() => {
    void getPersonaAsync().then(setPersona);
  }, []);

  return (
    <Stack
      screenOptions={{
        headerTitle: persona ? `Residential · ${persona === 'owner' ? 'Owner' : 'Worker'}` : 'Residential',
        headerBackTitle: 'Back',
      }}
    />
  );
}
