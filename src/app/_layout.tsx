import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ProjectBootstrap } from '@/components/project-bootstrap';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <ProjectBootstrap />
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="residential" options={{ headerShown: false }} />
        <Stack.Screen name="commercial/index" options={{ title: 'Commercial' }} />
      </Stack>
    </ThemeProvider>
  );
}
